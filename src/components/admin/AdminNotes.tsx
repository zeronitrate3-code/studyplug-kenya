import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface SubjectRow {
  id: string;
  name: string;
}
interface TopicRow {
  id: string;
  subject_id: string;
  grade_id: number | null;
  name: string;
  order_number: number;
}
interface NoteRow {
  id: string;
  topic_id: string;
  title: string;
}
interface PQRow {
  id: string;
  question: string;
  correct_answer: string;
}

const emptyNote = {
  title: "",
  introduction: "",
  content: "",
  key_points: "",
  examples: "",
  formulas: "",
  common_mistakes: "",
  summary: "",
  order_number: 1,
};

const emptyQuestion = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  explanation: "",
};

const AdminNotes = ({ subjects }: { subjects: SubjectRow[] }) => {
  const { toast } = useToast();
  const [subjectId, setSubjectId] = useState("mathematics");
  const [grade, setGrade] = useState(10);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [topicId, setTopicId] = useState("");
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [noteId, setNoteId] = useState("");
  const [questions, setQuestions] = useState<PQRow[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [noteForm, setNoteForm] = useState(emptyNote);
  const [qForm, setQForm] = useState(emptyQuestion);
  const [busy, setBusy] = useState(false);

  const loadTopics = async () => {
    const { data } = await supabase
      .from("topics")
      .select("id,subject_id,grade_id,name,order_number")
      .eq("subject_id", subjectId)
      .eq("grade_id", grade)
      .order("order_number");
    setTopics((data ?? []) as TopicRow[]);
  };

  useEffect(() => {
    setTopicId("");
    setNotes([]);
    setNoteId("");
    void loadTopics();
  }, [subjectId, grade]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadNotes = async (tid: string) => {
    const { data } = await supabase.from("notes").select("id,topic_id,title").eq("topic_id", tid).order("order_number");
    setNotes((data ?? []) as NoteRow[]);
  };

  useEffect(() => {
    setNoteId("");
    setQuestions([]);
    if (topicId) void loadNotes(topicId);
  }, [topicId]);

  const loadQuestions = async (nid: string) => {
    const { data } = await supabase.rpc("staff_list_practice_questions", { p_note_id: nid });
    setQuestions((data ?? []) as unknown as PQRow[]);
  };

  useEffect(() => {
    if (noteId) void loadQuestions(noteId);
  }, [noteId]);

  const addTopic = async () => {
    if (!newTopic.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("topics").insert({
      subject_id: subjectId,
      grade_id: grade,
      name: newTopic.trim(),
      order_number: topics.length + 1,
    });
    setBusy(false);
    if (error) return toast({ title: "Could not add topic", description: error.message, variant: "destructive" });
    setNewTopic("");
    toast({ title: "Topic added" });
    void loadTopics();
  };

  const deleteTopic = async (id: string) => {
    const { error } = await supabase.from("topics").delete().eq("id", id);
    if (error) return toast({ title: "Could not delete", description: error.message, variant: "destructive" });
    void loadTopics();
  };

  const saveNote = async () => {
    if (!topicId || !noteForm.title.trim()) {
      return toast({ title: "Pick a topic and add a title", variant: "destructive" });
    }
    setBusy(true);
    const { error } = await supabase.from("notes").insert({ ...noteForm, topic_id: topicId });
    setBusy(false);
    if (error) return toast({ title: "Could not save note", description: error.message, variant: "destructive" });
    setNoteForm(emptyNote);
    toast({ title: "Note saved" });
    void loadNotes(topicId);
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return toast({ title: "Could not delete", description: error.message, variant: "destructive" });
    if (noteId === id) setNoteId("");
    void loadNotes(topicId);
  };

  const addQuestion = async () => {
    if (!noteId || !qForm.question.trim()) {
      return toast({ title: "Pick a note and write a question", variant: "destructive" });
    }
    setBusy(true);
    const { error } = await supabase
      .from("practice_questions")
      .insert({ ...qForm, note_id: noteId, order_number: questions.length + 1 });
    setBusy(false);
    if (error) return toast({ title: "Could not add question", description: error.message, variant: "destructive" });
    setQForm(emptyQuestion);
    void loadQuestions(noteId);
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from("practice_questions").delete().eq("id", id);
    if (error) return toast({ title: "Could not delete", description: error.message, variant: "destructive" });
    void loadQuestions(noteId);
  };

  const field = (label: string, key: keyof typeof emptyNote, rows = 3) => (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Textarea
        rows={rows}
        value={noteForm[key] as string}
        onChange={(e) => setNoteForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-card-foreground">Notes content manager</h3>
        <div className="flex gap-2">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="flex-1 rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex gap-2">
          <Input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="New topic name" />
          <Button onClick={addTopic} disabled={busy} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 space-y-1">
          {topics.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2 rounded-lg border p-2 text-sm ${
                topicId === t.id ? "border-primary bg-accent" : "border-border"
              }`}
            >
              <button className="flex-1 text-left text-foreground" onClick={() => setTopicId(t.id)}>
                {t.name}
              </button>
              <button onClick={() => deleteTopic(t.id)} aria-label="Delete topic">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
          {!topics.length && <p className="text-xs text-muted-foreground">No topics for this grade yet.</p>}
        </div>
      </div>

      {topicId && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Notes in this topic</h3>
          <div className="space-y-1">
            {notes.map((n) => (
              <div
                key={n.id}
                className={`flex items-center gap-2 rounded-lg border p-2 text-sm ${
                  noteId === n.id ? "border-primary bg-accent" : "border-border"
                }`}
              >
                <button className="flex-1 text-left text-foreground" onClick={() => setNoteId(n.id)}>
                  {n.title}
                </button>
                <button onClick={() => deleteNote(n.id)} aria-label="Delete note">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))}
            {!notes.length && <p className="text-xs text-muted-foreground">No notes yet.</p>}
          </div>

          <div className="mt-4 space-y-3">
            <Input
              value={noteForm.title}
              onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Note title"
            />
            {field("Introduction", "introduction", 2)}
            {field("Key concepts / content", "content", 5)}
            {field("Key points (one per line)", "key_points")}
            {field("Examples", "examples", 4)}
            {field("Formulas", "formulas", 2)}
            {field("Common mistakes", "common_mistakes")}
            {field("Summary", "summary", 2)}
            <Button onClick={saveNote} disabled={busy} className="w-full">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save note
            </Button>
          </div>
        </div>
      )}

      {noteId && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Practice questions</h3>
          <div className="space-y-1">
            {questions.map((q) => (
              <div key={q.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                <span className="flex-1 text-foreground">{q.question}</span>
                <span className="text-xs text-muted-foreground">{q.correct_answer}</span>
                <button onClick={() => deleteQuestion(q.id)} aria-label="Delete question">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))}
            {!questions.length && <p className="text-xs text-muted-foreground">No practice questions yet.</p>}
          </div>

          <div className="mt-3 space-y-2">
            <Textarea
              rows={2}
              value={qForm.question}
              onChange={(e) => setQForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="Question"
            />
            {(["option_a", "option_b", "option_c", "option_d"] as const).map((k, i) => (
              <Input
                key={k}
                value={qForm[k]}
                onChange={(e) => setQForm((f) => ({ ...f, [k]: e.target.value }))}
                placeholder={`Option ${"ABCD"[i]}`}
              />
            ))}
            <div className="flex gap-2">
              <select
                value={qForm.correct_answer}
                onChange={(e) => setQForm((f) => ({ ...f, correct_answer: e.target.value }))}
                className="rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground"
              >
                {["A", "B", "C", "D"].map((k) => (
                  <option key={k} value={k}>
                    Correct: {k}
                  </option>
                ))}
              </select>
              <Input
                value={qForm.explanation}
                onChange={(e) => setQForm((f) => ({ ...f, explanation: e.target.value }))}
                placeholder="Explanation"
              />
            </div>
            <Button onClick={addQuestion} disabled={busy} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add practice question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotes;
