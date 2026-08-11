import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyContext } from "@/contexts/StudyContext";
import { subjectById } from "@/lib/curriculum";
import { toast } from "@/hooks/use-toast";
import {
  fetchBookmarks,
  fetchNote,
  fetchPracticeQuestions,
  fetchProgress,
  saveProgress,
  toggleBookmark,
  type NoteWithTopic,
  type PracticeQuestionRow,
} from "@/lib/notesService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Bot, CheckCircle2, Loader2 } from "lucide-react";

const Section = ({ title, body }: { title: string; body?: string | null }) => {
  if (!body?.trim()) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">{title}</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-card-foreground">{body}</p>
    </section>
  );
};

const Practice = ({ questions }: { questions: PracticeQuestionRow[] }) => {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const options = useMemo(
    () =>
      q
        ? ([
            ["A", q.option_a],
            ["B", q.option_b],
            ["C", q.option_c],
            ["D", q.option_d],
          ].filter(([, v]) => !!v) as [string, string][])
        : [],
    [q]
  );

  const reset = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (!questions.length) return null;

  if (done) {
    return (
      <section className="rounded-2xl border border-border bg-card p-4 text-center">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">Practice complete</h2>
        <p className="text-2xl font-bold text-foreground">
          {score}/{questions.length}
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          {score} correct • {questions.length - score} incorrect
        </p>
        <Button onClick={reset} className="w-full">
          Retry practice
        </Button>
      </section>
    );
  }

  const correct = picked !== null && picked === q.correct_answer.trim().toUpperCase();

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Practice</h2>
        <span className="text-[11px] text-muted-foreground">
          {index + 1} of {questions.length}
        </span>
      </div>
      <p className="mb-3 text-sm font-medium text-card-foreground">{q.question}</p>
      <div className="space-y-2">
        {options.map(([key, value]) => {
          const isPicked = picked === key;
          const isAnswer = key === q.correct_answer.trim().toUpperCase();
          const state =
            picked === null
              ? "border-border bg-background"
              : isAnswer
                ? "border-success bg-success/10"
                : isPicked
                  ? "border-destructive bg-destructive/10"
                  : "border-border bg-background opacity-60";
          return (
            <button
              key={key}
              disabled={picked !== null}
              onClick={() => {
                setPicked(key);
                if (key === q.correct_answer.trim().toUpperCase()) setScore((s) => s + 1);
              }}
              className={`w-full rounded-xl border p-3 text-left text-sm text-foreground transition-all active:scale-[0.99] ${state}`}
            >
              <span className="mr-2 font-semibold">{key}.</span>
              {value}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 space-y-2">
          <p className={`text-sm font-semibold ${correct ? "text-success" : "text-destructive"}`}>
            {correct ? "✓ Correct" : "✗ Incorrect"}
          </p>
          {q.explanation && <p className="text-xs text-muted-foreground">{q.explanation}</p>}
          <Button
            className="w-full"
            onClick={() => {
              if (index + 1 >= questions.length) setDone(true);
              else {
                setIndex((i) => i + 1);
                setPicked(null);
              }
            }}
          >
            {index + 1 >= questions.length ? "See score" : "Next question"}
          </Button>
        </div>
      )}
    </section>
  );
};

const NoteViewer = () => {
  const { noteId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setStudyContext } = useStudyContext();

  const [note, setNote] = useState<NoteWithTopic | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [n, qs] = await Promise.all([fetchNote(noteId), fetchPracticeQuestions(noteId)]);
        if (!active) return;
        setNote(n);
        setQuestions(qs);
        if (n?.topic) {
          setStudyContext({
            grade: n.topic.grade_id,
            subjectId: n.topic.subject_id,
            subjectName: subjectById(n.topic.subject_id).name,
            topicTitle: n.topic.name,
          });
        }
      } catch (e) {
        console.error("note viewer", e);
        toast({ title: "Could not load this note", variant: "destructive" });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [noteId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !noteId) return;
    (async () => {
      const [p, b] = await Promise.all([fetchProgress(user.id), fetchBookmarks(user.id)]);
      const row = p.find((r) => r.note_id === noteId);
      setCompleted(!!row?.completed);
      setBookmarked(b.includes(noteId));
    })();
  }, [user, noteId]);

  // Track how far the learner has read.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 100;
      setScrollPct((prev) => (pct > prev ? pct : prev));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [note]);

  // Persist reading progress when leaving the note.
  useEffect(() => {
    return () => {
      if (user && noteId && scrollPct > 0) {
        void saveProgress(user.id, noteId, { completed, progress_percentage: scrollPct });
      }
    };
  }, [user, noteId, scrollPct, completed]);

  const askTutor = () => {
    if (!note) return;
    const subject = note.topic ? subjectById(note.topic.subject_id).name : "";
    navigate(
      `/ai-tutor?q=${encodeURIComponent(
        `I am studying Grade ${note.topic?.grade_id ?? ""} ${subject}, topic "${note.topic?.name ?? ""}", note "${note.title}". Please help me understand it.`
      )}`
    );
  };

  const onComplete = async () => {
    if (!user || !note) return;
    const next = !completed;
    setCompleted(next);
    const err = await saveProgress(user.id, note.id, {
      completed: next,
      progress_percentage: next ? 100 : scrollPct,
    });
    if (err) toast({ title: "Could not save progress", description: err.message, variant: "destructive" });
  };

  const onBookmark = async () => {
    if (!user || !note) return;
    const next = !bookmarked;
    setBookmarked(next);
    const err = await toggleBookmark(user.id, note.id, next);
    if (err) {
      setBookmarked(!next);
      toast({ title: "Could not update bookmark", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-10 text-center">
        <p className="text-sm text-muted-foreground">This note could not be found.</p>
        <Button className="mt-4" onClick={() => navigate("/notes")}>
          Back to Notes
        </Button>
      </div>
    );
  }

  const subject = note.topic ? subjectById(note.topic.subject_id) : null;

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-4 px-4 pb-32 pt-6">
      <div className="fixed left-0 right-0 top-0 z-40 h-1 bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${completed ? 100 : scrollPct}%` }} />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/notes")}
          className="rounded-lg border border-border bg-card p-2"
          aria-label="Back to notes"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] text-muted-foreground">
            {subject ? `${subject.icon} ${subject.name}` : "Notes"}
            {note.topic ? ` • ${note.topic.name}` : ""}
          </p>
          <h1 className="text-lg font-bold leading-tight text-foreground">{note.title}</h1>
        </div>
        <button onClick={onBookmark} className="rounded-lg border border-border bg-card p-2" aria-label="Bookmark note">
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
        </button>
      </div>

      {note.introduction && (
        <p className="rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
          {note.introduction}
        </p>
      )}

      <Section title="Key concepts" body={note.content} />
      <Section title="Key points" body={note.key_points} />
      <Section title="Examples" body={note.examples} />
      <Section title="Important formulas" body={note.formulas} />
      <Section title="Common mistakes" body={note.common_mistakes} />
      <Section title="Quick summary" body={note.summary} />

      <Practice questions={questions} />

      <div className="space-y-2">
        <Button onClick={onComplete} variant={completed ? "outline" : "default"} className="w-full">
          {completed ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Completed — tap to undo
            </>
          ) : (
            "✓ Mark as completed"
          )}
        </Button>
        <Button onClick={onBookmark} variant="outline" className="w-full">
          <Bookmark className={`mr-2 h-4 w-4 ${bookmarked ? "fill-secondary text-secondary" : ""}`} />
          {bookmarked ? "Remove bookmark" : "Bookmark this note"}
        </Button>
        <Button onClick={askTutor} variant="secondary" className="w-full">
          <Bot className="mr-2 h-4 w-4" /> Ask AI Tutor
        </Button>
      </div>
    </div>
  );
};

export default NoteViewer;
