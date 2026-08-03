import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useStudyContext } from "@/contexts/StudyContext";
import { findTopic, subjectById } from "@/lib/curriculum";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Bookmark, CheckCircle2, Clock, Loader2, RefreshCw, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NOTES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notes-generate`;
const cacheKey = (k: string) => `studyplug:note:${k}`;

const AI_ACTIONS = [
  "Explain More",
  "Give More Examples",
  "Generate Quiz",
  "Summarize Topic",
  "Simplify Explanation",
];

const NoteTopicPage = () => {
  const { topicKey = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setStudyContext } = useStudyContext();
  const topic = findTopic(topicKey);

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);

  const load = useCallback(
    async (force = false) => {
      if (!topic) return;
      setLoading(true);
      const cached = localStorage.getItem(cacheKey(topicKey));
      if (cached && !force) {
        setContent(cached);
        setLoading(false);
        return;
      }
      try {
        const { data: sess } = await supabase.auth.getSession();
        const resp = await fetch(NOTES_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sess.session?.access_token ?? ""}`,
          },
          body: JSON.stringify({
            grade: topic.grade,
            subject: subjectById(topic.subjectId).name,
            topic: topic.title,
          }),
        });
        if (!resp.ok) {
          if (resp.status === 429) toast({ title: "Slow down", description: "Too many requests. Try again shortly." });
          else if (resp.status === 402)
            toast({ title: "AI credits exhausted", description: "Add credits in workspace settings.", variant: "destructive" });
          else toast({ title: "Could not load notes", variant: "destructive" });
          setContent(cached ?? "");
          return;
        }
        const { content: text } = await resp.json();
        setContent(text);
        localStorage.setItem(cacheKey(topicKey), text);
      } catch (e) {
        console.error("note load error", e);
        toast({ title: "Offline", description: "Connect to the internet to load this note." });
        setContent(cached ?? "");
      } finally {
        setLoading(false);
      }
    },
    [topic, topicKey]
  );

  useEffect(() => {
    if (!topic) return;
    setStudyContext({
      grade: topic.grade,
      subjectId: topic.subjectId,
      subjectName: subjectById(topic.subjectId).name,
      topicTitle: topic.title,
    });
    load();
  }, [topicKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !topic) return;
    (async () => {
      const { data } = await supabase
        .from("note_progress")
        .select("bookmarked,completed")
        .eq("user_id", user.id)
        .eq("topic_key", topicKey)
        .maybeSingle();
      if (data) {
        setBookmarked(data.bookmarked);
        setCompleted(data.completed);
      }
    })();
  }, [user, topicKey, topic]);

  const saveProgress = async (patch: { bookmarked?: boolean; completed?: boolean }) => {
    if (!user || !topic) return;
    const next = { bookmarked, completed, ...patch };
    setBookmarked(next.bookmarked);
    setCompleted(next.completed);
    const { error } = await supabase.from("note_progress").upsert(
      {
        user_id: user.id,
        topic_key: topicKey,
        grade: topic.grade,
        subject_id: topic.subjectId,
        bookmarked: next.bookmarked,
        completed: next.completed,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_key" }
    );
    if (error) toast({ title: "Could not save progress", description: error.message, variant: "destructive" });
  };

  const askAI = (action: string) => {
    if (!topic) return;
    navigate(
      `/ai-tutor?q=${encodeURIComponent(
        `${action} for the Grade ${topic.grade} ${subjectById(topic.subjectId).name} topic "${topic.title}".`
      )}`
    );
  };

  if (!topic) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-10 text-center">
        <p className="text-sm text-muted-foreground">This topic could not be found.</p>
        <Button className="mt-4" onClick={() => navigate("/notes")}>Back to Notes</Button>
      </div>
    );
  }

  const subject = subjectById(topic.subjectId);

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-4 px-4 pb-28 pt-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/notes")} className="rounded-lg border border-border bg-card p-2" aria-label="Back">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground">
            Grade {topic.grade} • {subject.name}
          </p>
          <h1 className="text-lg font-bold leading-tight text-foreground">{topic.title}</h1>
        </div>
        <button
          onClick={() => saveProgress({ bookmarked: !bookmarked })}
          className="rounded-lg border border-border bg-card p-2"
          aria-label="Bookmark topic"
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {topic.readingMinutes} min read</span>
        <button onClick={() => load(true)} className="flex items-center gap-1 underline">
          <RefreshCw className="h-3 w-3" /> Regenerate
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
          <p className="pt-2 text-xs text-muted-foreground">Preparing your notes…</p>
        </div>
      ) : (
        <article className="prose prose-sm max-w-none rounded-2xl border border-border bg-card p-4 text-card-foreground dark:prose-invert">
          <ReactMarkdown>{content || "No notes available yet."}</ReactMarkdown>
        </article>
      )}

      <div>
        <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-foreground">
          <Sparkle className="h-4 w-4 text-primary" /> Ask AI about this topic
        </p>
        <div className="flex flex-wrap gap-2">
          {AI_ACTIONS.map((a) => (
            <button
              key={a}
              onClick={() => askAI(a)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => saveProgress({ completed: !completed })}
        variant={completed ? "outline" : "default"}
        className="w-full"
      >
        {completed ? (
          <><CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Completed — tap to undo</>
        ) : (
          "Mark topic as completed"
        )}
      </Button>
      {loading && <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
};

export default NoteTopicPage;
