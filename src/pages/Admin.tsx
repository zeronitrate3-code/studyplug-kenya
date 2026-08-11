import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Shield, Plus, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AdminLearners from "@/components/admin/AdminLearners";
import AdminBroadcast from "@/components/admin/AdminBroadcast";
import AdminNotes from "@/components/admin/AdminNotes";



interface SubjectRow {
  id: string;
  name: string;
}

interface QuestionRow {
  id: string;
  subject_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  grade_id: number | null;
}

const emptyForm = {
  subject_id: "",
  grade_id: 7,
  question: "",
  options: ["", "", "", ""],
  correct_answer: 0,
  explanation: "",
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isStaff, isAdmin, loading: roleLoading } = useRoles();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [filterSubject, setFilterSubject] = useState("mathematics");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ students: 0, questions: 0, results: 0 });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    (async () => {
      const [{ data: subs }, { count: profileCount }, { count: qCount }, { count: rCount }] = await Promise.all([
        supabase.from("subjects").select("id,name").order("name"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("questions").select("id", { count: "exact", head: true }),
        supabase.from("results").select("id", { count: "exact", head: true }),
      ]);
      setSubjects(subs ?? []);
      setStats({ students: profileCount ?? 0, questions: qCount ?? 0, results: rCount ?? 0 });
    })();
  }, []);

  const loadQuestions = async (subjectId: string) => {
    const { data } = await supabase
      .from("questions")
      .select("id,subject_id,question,options,correct_answer,explanation,grade_id")
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false })
      .limit(50);
    setQuestions((data ?? []) as unknown as QuestionRow[]);
  };

  useEffect(() => {
    if (isStaff) loadQuestions(filterSubject);
  }, [filterSubject, isStaff]);

  const addQuestion = async () => {
    if (!form.subject_id || !form.question.trim() || form.options.some((o) => !o.trim())) {
      toast({ title: "Missing details", description: "Pick a subject and fill the question with all 4 options.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("questions").insert({
      subject_id: form.subject_id,
      grade_id: form.grade_id,
      question: form.question.trim(),
      options: form.options.map((o) => o.trim()),
      correct_answer: form.correct_answer,
      explanation: form.explanation.trim() || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Question added" });
    setForm({ ...emptyForm, subject_id: form.subject_id, grade_id: form.grade_id });
    if (form.subject_id === filterSubject) loadQuestions(filterSubject);
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    setQuestions((q) => q.filter((x) => x.id !== id));
  };

  const uploadDoc = async (file: File) => {
    setUploading(true);
    const path = `${filterSubject}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("revision-docs").upload(path, file);
    setUploading(false);
    toast({
      title: error ? "Upload failed" : "Document uploaded",
      description: error ? error.message : file.name,
      variant: error ? "destructive" : undefined,
    });
  };

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <Shield className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Admins only</h1>
        <p className="text-sm text-muted-foreground">This dashboard is for teachers and administrators.</p>
        <button onClick={() => navigate("/")} className="text-sm text-primary underline">Back to dashboard</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> {isAdmin ? "Owner console" : "Admin"}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Students", value: stats.students },
          { label: "Questions", value: stats.questions },
          { label: "Exams sat", value: stats.results },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {isAdmin && (
        <>
          <AdminBroadcast />
          <AdminLearners />
        </>
      )}

      <AdminNotes subjects={subjects} />



      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Plus className="h-4 w-4" /> Add a question</h2>

        <select
          value={form.subject_id}
          onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">Select subject…</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select
          value={form.grade_id}
          onChange={(e) => setForm({ ...form, grade_id: Number(e.target.value) })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Grade {i + 1}</option>)}
        </select>

        <Textarea
          placeholder="Question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />

        {form.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={form.correct_answer === i}
              onChange={() => setForm({ ...form, correct_answer: i })}
              className="accent-primary"
            />
            <Input
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              value={opt}
              onChange={(e) => {
                const options = [...form.options];
                options[i] = e.target.value;
                setForm({ ...form, options });
              }}
            />
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground">Select the radio button next to the correct answer.</p>

        <Textarea
          placeholder="Explanation (optional)"
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
        />

        <Button onClick={addQuestion} disabled={saving} className="w-full">
          {saving ? "Saving…" : "Add question"}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Manage questions</h2>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {questions.map((q) => (
            <div key={q.id} className="flex items-start justify-between gap-2 rounded-xl border border-border p-3">
              <div>
                <p className="text-xs font-medium text-foreground">{q.question}</p>
                <p className="text-[11px] text-success mt-1">✔ {q.options?.[q.correct_answer]}</p>
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {questions.length === 0 && <p className="text-xs text-muted-foreground">No questions for this subject yet.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Upload className="h-4 w-4" /> Revision documents</h2>
        <p className="text-xs text-muted-foreground">Uploaded to the <strong>{subjects.find((s) => s.id === filterSubject)?.name}</strong> folder.</p>
        <input
          type="file"
          disabled={uploading}
          onChange={(e) => e.target.files?.[0] && uploadDoc(e.target.files[0])}
          className="w-full text-xs text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default Admin;
