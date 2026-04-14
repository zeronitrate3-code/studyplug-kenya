import { useState, useRef } from "react";
import { ArrowLeft, Send, ImagePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  from: "user" | "bot";
  timestamp: Date;
}

const AUTO_REPLIES: Record<string, string> = {
  help: "We're here to help! Please describe your issue in detail and attach a screenshot if possible. Our support team will get back to you soon.",
  exam: "For exam-related issues, make sure you have a stable internet connection. If an exam freezes, try refreshing the page — your progress is saved automatically.",
  login: "Having trouble logging in? Try resetting your password or signing in with Google. If the issue persists, describe what happens step by step.",
  default: "Thanks for reaching out! 📩 Our team has received your message and will respond within 24 hours. In the meantime, feel free to share more details or screenshots.",
};

function getAutoReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("exam") || lower.includes("test") || lower.includes("quiz")) return AUTO_REPLIES.exam;
  if (lower.includes("login") || lower.includes("sign") || lower.includes("password")) return AUTO_REPLIES.login;
  if (lower.includes("help")) return AUTO_REPLIES.help;
  return AUTO_REPLIES.default;
}

const Support = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "👋 Welcome to StudyPlug Support! Type your question or upload a screenshot of any issue you're facing. We're here to help!",
      from: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 5MB.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSend = async () => {
    if (!input.trim() && !imageFile) return;
    setSending(true);

    let uploadedUrl: string | undefined;

    // Upload image if present
    if (imageFile && user) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(`support/${path}`, imageFile);
      if (!error) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(`support/${path}`);
        uploadedUrl = data.publicUrl;
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      imageUrl: uploadedUrl || imagePreview || undefined,
      from: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    removeImage();
    scrollToBottom();

    // Auto-reply after a short delay
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutoReply(userMsg.text),
        from: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      scrollToBottom();
      setSending(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">?</div>
          <div>
            <p className="text-sm font-semibold text-foreground">StudyPlug Support</p>
            <p className="text-xs text-success">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.from === "user"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border text-card-foreground rounded-bl-md"
              }`}
            >
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Uploaded" className="rounded-lg mb-2 max-h-48 w-full object-cover" />
              )}
              {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
              <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2 bg-card border-t border-border">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 rounded-lg" />
            <button onClick={removeImage} className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground h-5 w-5 flex items-center justify-center">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-3 flex items-end gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleImageSelect}
          className="hidden"
        />
        <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-primary p-2">
          <ImagePlus className="h-5 w-5" />
        </button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your issue..."
          className="min-h-[40px] max-h-[120px] flex-1 resize-none text-sm"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={sending || (!input.trim() && !imageFile)} size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Support;
