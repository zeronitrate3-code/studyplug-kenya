import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useStudyContext } from "@/contexts/StudyContext";
import {
  defaultSubjectsForGrade,
  subjectById,
  topicsFor,
  type NoteTopic,
} from "@/lib/curriculum";
import { BookOpen, Bookmark, CheckCircle2, ChevronRight, Clock, Search } from "lucide-react";

interface ProgressRow {
  topic_key: string;
  bookmarked: boolean;
  completed: boolean;
}

const Notes = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { setStudyContext } = useStudyContext();
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});

  const grade = profile?.grade ?? 7;
  const subjects = useMemo(() => {
    const ids = profile?.selected_subjects?.length
      ? profile.selected_subjects
      : defaultSubjectsForGrade(grade);
    return ids.map(subjectById);
  }, [profile?.selected_subjects, grade]);

  useEffect(() => {
    if (!activeSubject && subjects.length) setActiveSubject(subjects[0].id);
  }, [subjects, activeSubject]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("note_progress")
        .select("topic_key,bookmarked,completed")
        .eq("user_id", user.id);
      if (data) {
        setProgress(Object.fromEntries(data.map((r) => [r.topic_key, r as ProgressRow])));
      }
    })();
  }, [user]);

  const topics: NoteTopic[] = useMemo(() => {
    if (query.trim()) {
      return subjects.flatMap((s) =>
        topicsFor(s.id, grade).filter(
          (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
    return activeSubject ? topicsFor(activeSubject, grade) : [];
  }, [query, activeSubject, grade, subjects]);

  const completedCount = topics.filter((t) => progress[t.id]?.completed).length;

  const openTopic = (t: NoteTopic) => {
    setStudyContext({
      grade,
      subjectId: t.subjectId,
      subjectName: subjectById(t.subjectId).name,
      topicTitle: t.title,
    });
    navigate(`/notes/${t.id}`);
  };

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-5 px-4 pb-28 pt-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <BookOpen className="h-5 w-5 text-primary" /> Smart Notes
        </h1>
        <p className="text-xs text-muted-foreground">Grade {grade} • your selected subjects</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes and topics…"
          className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {!query && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSubject(s.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                activeSubject === s.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-card-foreground"
              }`}
            >
              <span>{s.icon}</span> {s.name}
            </button>
          ))}
        </div>
      )}

      {!query && topics.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-card-foreground">Reading progress</span>
            <span className="text-muted-foreground">
              {completedCount}/{topics.length} topics
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${topics.length ? (completedCount / topics.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {topics.map((t) => {
          const p = progress[t.id];
          return (
            <button
              key={t.id}
              onClick={() => openTopic(t)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-2xl">{subjectById(t.subjectId).icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground">{t.title}</p>
                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {t.readingMinutes} min read
                  {query && <span>• {subjectById(t.subjectId).name}</span>}
                </p>
              </div>
              {p?.bookmarked && <Bookmark className="h-4 w-4 fill-secondary text-secondary" />}
              {p?.completed && <CheckCircle2 className="h-4 w-4 text-success" />}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
        {topics.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No topics found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Notes;
