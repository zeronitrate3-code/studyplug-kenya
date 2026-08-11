import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyContext } from "@/contexts/StudyContext";
import {
  defaultSubjectsForGrade,
  subjectById,
  topicsFor,
  type NoteTopic,
} from "@/lib/curriculum";
import {
  fetchBookmarks,
  fetchNotesForGrade,
  fetchProgress,
  type NoteWithTopic,
  type ProgressRow,
} from "@/lib/notesService";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

type Tab = "browse" | "saved" | "ai";

const Notes = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { setStudyContext } = useStudyContext();

  const [tab, setTab] = useState<Tab>("browse");
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<number>(profile?.grade ?? 7);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteWithTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    if (profile?.grade) setGrade(profile.grade);
  }, [profile?.grade]);

  const subjects = useMemo(() => {
    const ids = profile?.selected_subjects?.length
      ? profile.selected_subjects
      : defaultSubjectsForGrade(grade);
    return ids.map(subjectById);
  }, [profile?.selected_subjects, grade]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const { notes: rows } = await fetchNotesForGrade(
          grade,
          subjects.map((s) => s.id)
        );
        if (active) setNotes(rows);
      } catch (e) {
        console.error("notes load", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [grade, subjects]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, b] = await Promise.all([fetchProgress(user.id), fetchBookmarks(user.id)]);
      setProgress(Object.fromEntries(p.map((r) => [r.note_id, r])));
      setBookmarks(b);
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = notes;
    if (q) {
      list = notes.filter((n) => {
        const subject = n.topic ? subjectById(n.topic.subject_id).name : "";
        return (
          n.title.toLowerCase().includes(q) ||
          (n.topic?.name ?? "").toLowerCase().includes(q) ||
          subject.toLowerCase().includes(q) ||
          (n.introduction ?? "").toLowerCase().includes(q) ||
          (n.key_points ?? "").toLowerCase().includes(q)
        );
      });
    } else if (activeSubject) {
      list = notes.filter((n) => n.topic?.subject_id === activeSubject);
    }
    return list;
  }, [notes, query, activeSubject]);

  const savedNotes = notes.filter((n) => bookmarks.includes(n.id));
  const recent = useMemo(() => {
    const ordered = Object.values(progress)
      .sort((a, b) => (a.last_viewed_at < b.last_viewed_at ? 1 : -1))
      .slice(0, 3);
    return ordered
      .map((p) => notes.find((n) => n.id === p.note_id))
      .filter(Boolean) as NoteWithTopic[];
  }, [progress, notes]);

  const completedCount = notes.filter((n) => progress[n.id]?.completed).length;
  const pct = notes.length ? Math.round((completedCount / notes.length) * 100) : 0;

  const openNote = (n: NoteWithTopic) => {
    if (n.topic) {
      setStudyContext({
        grade: n.topic.grade_id ?? grade,
        subjectId: n.topic.subject_id,
        subjectName: subjectById(n.topic.subject_id).name,
        topicTitle: n.topic.name,
      });
    }
    navigate(`/notes/view/${n.id}`);
  };

  const aiTopics: NoteTopic[] = useMemo(
    () => (activeSubject ? topicsFor(activeSubject, grade) : []),
    [activeSubject, grade]
  );

  const NoteCard = ({ n }: { n: NoteWithTopic }) => {
    const p = progress[n.id];
    const subject = n.topic ? subjectById(n.topic.subject_id) : null;
    return (
      <button
        onClick={() => openNote(n)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
      >
        <span className="text-2xl">{subject?.icon ?? "📘"}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-card-foreground">{n.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {subject?.name} • {n.topic?.name}
          </p>
          {p && p.progress_percentage > 0 && !p.completed && (
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress_percentage}%` }} />
            </div>
          )}
        </div>
        {bookmarks.includes(n.id) && <Bookmark className="h-4 w-4 shrink-0 fill-secondary text-secondary" />}
        {p?.completed && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    );
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
          placeholder="Search notes, subjects or topics..."
          className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-2">
        {(
          [
            ["browse", "Browse"],
            ["saved", "Saved"],
            ["ai", "AI topics"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-card-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab !== "saved" && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground" htmlFor="grade-select">
              Grade
            </label>
            <select
              id="grade-select"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="rounded-lg border border-input bg-card px-2 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveSubject(null)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                activeSubject === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-card-foreground"
              }`}
            >
              All
            </button>
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
        </>
      )}

      {tab === "browse" && (
        <>
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-card-foreground">Reading progress</span>
              <span className="text-muted-foreground">
                {completedCount}/{notes.length} notes • {pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {!query && recent.length > 0 && (
            <section className="space-y-2">
              <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-primary" /> Recently viewed
              </p>
              {recent.map((n) => (
                <NoteCard key={`recent-${n.id}`} n={n} />
              ))}
            </section>
          )}

          <section className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length ? (
              filtered.map((n) => <NoteCard key={n.id} n={n} />)
            ) : (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No notes found. Try another topic or subject.
              </p>
            )}
          </section>
        </>
      )}

      {tab === "saved" && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Saved notes</p>
          {savedNotes.length ? (
            savedNotes.map((n) => <NoteCard key={`saved-${n.id}`} n={n} />)
          ) : (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              You have not bookmarked any notes yet.
            </p>
          )}
        </section>
      )}

      {tab === "ai" && (
        <section className="space-y-2">
          <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> AI-generated topic notes
          </p>
          {aiTopics.length ? (
            aiTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setStudyContext({
                    grade,
                    subjectId: t.subjectId,
                    subjectName: subjectById(t.subjectId).name,
                    topicTitle: t.title,
                  });
                  navigate(`/notes/${t.id}`);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              >
                <span className="text-2xl">{subjectById(t.subjectId).icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{t.title}</p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {t.readingMinutes} min read
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Pick a subject above to see AI topics.
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default Notes;
