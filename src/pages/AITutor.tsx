import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Image as ImageIcon, X, Trash2, Loader2, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface TutorMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  image_url: string | null;
}

const TUTOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;
const TUTOR_IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor-image`;

const AITutor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<TutorMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageMode, setImageMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("ai_tutor_messages")
        .select("id,role,content,image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data as TutorMsg[]);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("tutor-uploads").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    return supabase.storage.from("tutor-uploads").getPublicUrl(path).data.publicUrl;
  };

  const send = async () => {
    if (!user || sending) return;
    const text = input.trim();
    if (!text && !imageFile) return;
    if (imageMode) return sendImage(text);

    setSending(true);
    let imgUrl: string | null = null;
    if (imageFile) {
      imgUrl = await uploadImage(imageFile);
      setImageFile(null);
      setImagePreview(null);
    }

    // Persist user message
    const userContent = text || "(image attached)";
    const { data: insertedUser } = await supabase
      .from("ai_tutor_messages")
      .insert({ user_id: user.id, role: "user", content: userContent, image_url: imgUrl })
      .select("id,role,content,image_url")
      .single();

    const userMsg: TutorMsg = insertedUser
      ? (insertedUser as TutorMsg)
      : { id: crypto.randomUUID(), role: "user", content: userContent, image_url: imgUrl };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Build payload — send last 20 messages + new one. Use multimodal content if image.
    const history = [...messages, userMsg].slice(-20).map((m) => {
      if (m.image_url && m.role === "user") {
        return {
          role: m.role,
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: m.image_url } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    // Add placeholder assistant message
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", image_url: null }]);

    let assistantText = "";
    try {
      const resp = await fetch(TUTOR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Slow down", description: "Too many requests. Try again in a moment." });
        else if (resp.status === 402) toast({ title: "AI credits exhausted", description: "Add credits in workspace settings.", variant: "destructive" });
        else toast({ title: "AI error", description: "Could not get a reply.", variant: "destructive" });
        // Remove placeholder
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        setSending(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: assistantText } : m));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      // Persist assistant message
      if (assistantText.trim()) {
        await supabase.from("ai_tutor_messages").insert({
          user_id: user.id,
          role: "assistant",
          content: assistantText,
        });
      }
    } catch (e) {
      console.error("tutor stream error:", e);
      toast({ title: "Connection error", description: "Check your internet.", variant: "destructive" });
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setSending(false);
    }
  };

  const sendImage = async (text: string) => {
    if (!user) return;
    if (!text && !imageFile) return;
    setSending(true);
    try {
      let imgUrl: string | null = null;
      if (imageFile) {
        imgUrl = await uploadImage(imageFile);
        setImageFile(null);
        setImagePreview(null);
      }
      const promptText = text || (imgUrl ? "Enhance and improve this photo" : "");

      // Persist user message
      const { data: insertedUser } = await supabase
        .from("ai_tutor_messages")
        .insert({ user_id: user.id, role: "user", content: promptText || "(image request)", image_url: imgUrl })
        .select("id,role,content,image_url").single();
      const userMsg: TutorMsg = insertedUser
        ? (insertedUser as TutorMsg)
        : { id: crypto.randomUUID(), role: "user", content: promptText, image_url: imgUrl };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      const placeholderId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: placeholderId, role: "assistant", content: "🎨 Generating image…", image_url: null }]);

      const resp = await fetch(TUTOR_IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: promptText, image_url: imgUrl }),
      });

      if (!resp.ok) {
        if (resp.status === 429) toast({ title: "Slow down", description: "Too many requests." });
        else if (resp.status === 402) toast({ title: "AI credits exhausted", variant: "destructive" });
        else toast({ title: "Image AI error", description: "Could not generate image.", variant: "destructive" });
        setMessages((prev) => prev.filter((m) => m.id !== placeholderId));
        return;
      }

      const { image_b64 } = await resp.json();
      // Upload generated image to storage so it persists
      const bytes = Uint8Array.from(atob(image_b64), (c) => c.charCodeAt(0));
      const path = `${user.id}/gen-${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from("tutor-uploads").upload(path, bytes, { contentType: "image/png" });
      let publicUrl: string;
      if (upErr) {
        publicUrl = `data:image/png;base64,${image_b64}`;
      } else {
        publicUrl = supabase.storage.from("tutor-uploads").getPublicUrl(path).data.publicUrl;
      }

      const caption = imgUrl ? "Here's your enhanced photo:" : "Here's the image you asked for:";
      await supabase.from("ai_tutor_messages").insert({
        user_id: user.id, role: "assistant", content: caption, image_url: publicUrl,
      });
      setMessages((prev) => prev.map((m) =>
        m.id === placeholderId ? { ...m, content: caption, image_url: publicUrl } : m
      ));
    } catch (e) {
      console.error("image gen error:", e);
      toast({ title: "Connection error", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };


  const clearChat = async () => {
    if (!user) return;
    if (!confirm("Clear your entire AI tutor history?")) return;
    await supabase.from("ai_tutor_messages").delete().eq("user_id", user.id);
    setMessages([]);
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in flex flex-col h-screen max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xs font-medium">Back</span>
        </button>
        <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">StudyPlug AI Tutor</p>
          <p className="text-xs text-muted-foreground">Ask anything · upload homework photos</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive" title="Clear history">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="text-5xl">🤖</div>
            <p className="text-sm font-semibold text-foreground">Hi! I'm your study buddy.</p>
            <p className="text-xs text-muted-foreground px-6">Ask me about Math, Science, English, Kiswahili, or any subject. You can even upload a photo of your homework!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
                {!isUser && (
                  <div className="h-7 w-7 shrink-0 rounded-full gradient-primary flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  isUser
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  {m.image_url && (
                    <img src={m.image_url} alt="upload" className="rounded-lg max-w-full max-h-56 mb-1 object-cover" />
                  )}
                  {isUser ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  ) : (
                    <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:mb-1 prose-headings:mt-2 prose-ul:my-1 prose-ol:my-1 dark:prose-invert">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {imagePreview && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-20 rounded-lg object-cover" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card p-3 safe-bottom">
        {imageMode && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs text-primary">
            <Wand2 className="h-3.5 w-3.5" />
            <span className="flex-1">Image mode — describe an image to generate, or attach a photo to enhance.</span>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground" disabled={sending} title="Attach photo">
            <ImageIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setImageMode((v) => !v)}
            className={`rounded-lg p-1 transition-colors ${imageMode ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            disabled={sending}
            title="Toggle image generation mode"
          >
            <Wand2 className="h-5 w-5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={imageMode ? "Describe the image to create…" : "Ask the AI tutor..."}
            disabled={sending}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={sending || (!input.trim() && !imageFile)}
            className="rounded-xl gradient-primary p-2.5 text-primary-foreground shadow-sm disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
