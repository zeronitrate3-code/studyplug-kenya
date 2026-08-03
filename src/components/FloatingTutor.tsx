import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyContext } from "@/contexts/StudyContext";
import { subjectAccent, subjectById } from "@/lib/curriculum";
import { toast } from "@/hooks/use-toast";
import { Send, X, Loader2, GraduationCap } from "lucide-react";
import ReactMarkdown from "react-markdown";

const TUTOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  "Explain this topic",
  "Summarize this lesson",
  "Generate practice questions",
  "Give another example",
  "Quiz me",
  "Simplify explanation",
];

const HIDDEN_PREFIXES = ["/exam/", "/auth", "/ai-tutor", "/reset-password"];

const FloatingTutor = () => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const study = useStudyContext();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - 76 : 300,
    y: typeof window !== "undefined" ? window.innerHeight - 190 : 500,
  }));
  const dragRef = useRef({ dragging: false, moved: false, dx: 0, dy: 0 });
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const accent = subjectAccent(study.subjectId);
  const grade = study.grade ?? profile?.grade ?? null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  // Keep the orb inside the viewport on resize/orientation change.
  useEffect(() => {
    const onResize = () =>
      setPos((p) => ({
        x: Math.min(p.x, window.innerWidth - 64),
        y: Math.min(p.y, window.innerHeight - 100),
      }));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { dragging: true, moved: false, dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const x = Math.max(8, Math.min(window.innerWidth - 64, e.clientX - dragRef.current.dx));
    const y = Math.max(8, Math.min(window.innerHeight - 72, e.clientY - dragRef.current.dy));
    if (Math.abs(x - pos.x) > 3 || Math.abs(y - pos.y) > 3) dragRef.current.moved = true;
    setPos({ x, y });
  };

  const onPointerUp = () => {
    const moved = dragRef.current.moved;
    dragRef.current.dragging = false;
    if (!moved) setOpen(true);
  };

  const contextLine = useCallback(() => {
    const bits: string[] = [];
    if (grade) bits.push(`Grade ${grade}`);
    if (study.subjectId) bits.push(`Subject: ${study.subjectName ?? subjectById(study.subjectId).name}`);
    if (study.topicTitle) bits.push(`Topic: ${study.topicTitle}`);
    if (profile?.selected_subjects?.length)
      bits.push(`Learner's chosen subjects: ${profile.selected_subjects.join(", ")}`);
    return bits.length ? `[Student context — ${bits.join(" | ")}]` : "";
  }, [grade, study.subjectId, study.subjectName, study.topicTitle, profile?.selected_subjects]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || sending) return;
    if (!user) {
      toast({ title: "Sign in first", description: "Log in to chat with your AI tutor." });
      return;
    }
    setInput("");
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const ctx = contextLine();
      const history = [...messages, userMsg].slice(-16).map((m, i, arr) => ({
        role: m.role,
        content: i === arr.length - 1 && ctx ? `${ctx}\n\n${m.content}` : m.content,
      }));

      const resp = await fetch(TUTOR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sess.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Slow down", description: "Too many requests. Try again shortly." });
        else if (resp.status === 402)
          toast({ title: "AI credits exhausted", description: "Add credits in workspace settings.", variant: "destructive" });
        else toast({ title: "AI error", description: "Could not get a reply.", variant: "destructive" });
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
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
              acc += delta;
              setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error("floating tutor error", e);
      toast({ title: "Connection error", description: "Check your internet.", variant: "destructive" });
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (!user) return null;
  if (HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p))) return null;

  return createPortal(
    <>
      {/* Orb */}
      {!open && (
        <button
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            left: pos.x,
            top: pos.y,
            background: `radial-gradient(circle at 30% 30%, hsl(${accent} / 0.95), hsl(${accent} / 0.65))`,
            boxShadow: `0 0 0 6px hsl(${accent} / 0.15), 0 10px 30px -6px hsl(${accent} / 0.55)`,
          }}
          className="fixed z-[60] flex h-14 w-14 touch-none items-center justify-center rounded-full text-primary-foreground transition-transform active:scale-90 animate-scale-in"
          aria-label="Open AI tutor"
        >
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: `hsl(${accent})` }} />
          <GraduationCap className="relative h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[78vh] w-full max-w-lg flex-col rounded-t-3xl border border-border bg-card shadow-2xl animate-slide-in-right sm:animate-scale-in"
          >
            <header
              className="flex items-center gap-3 rounded-t-3xl px-4 py-3 text-primary-foreground"
              style={{ background: `linear-gradient(135deg, hsl(${accent}), hsl(${accent} / 0.7))` }}
            >
              <GraduationCap className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">StudyPlug AI Tutor</p>
                <p className="text-[11px] opacity-90">
                  {grade ? `Grade ${grade}` : "Your tutor"}
                  {study.subjectId ? ` • ${study.subjectName ?? subjectById(study.subjectId).name}` : ""}
                  {study.topicTitle ? ` • ${study.topicTitle}` : ""}
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close tutor" className="rounded-full p-1.5 hover:bg-primary-foreground/20">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                  <p className="text-sm font-medium text-card-foreground">Habari! I'm your personal tutor 👋</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ask me anything about your subjects — I explain step by step.
                  </p>
                </div>
              )}
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="prose prose-sm max-w-none text-sm text-foreground dark:prose-invert">
                    {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                )
              )}
              <div ref={endRef} />
            </div>

            <div className="flex gap-2 overflow-x-auto border-t border-border px-3 py-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => send(a)}
                  disabled={sending}
                  className="whitespace-nowrap rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  {a}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-end gap-2 border-t border-border p-3 safe-bottom"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                placeholder="Ask your tutor anything…"
                className="max-h-28 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                aria-label="Send"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default FloatingTutor;
