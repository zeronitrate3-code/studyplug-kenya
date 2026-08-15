import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Camera, Loader2, Sparkles, Trash2, Wand2 } from "lucide-react";

interface SubjectRow {
  id: string;
  name: string;
}

export interface DraftQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: string;
  duplicate?: boolean;
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const AdminAI = ({ subjects, onPublished }: { subjects: SubjectRow[]; onPublished?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const photoRef = useRef<HTMLInputElement>(null);

  const [subjectId, setSubjectId] = useState("");
  const [grade, setGrade] = useState(7);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [notes, setNotes] = useState("");

  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const subjectName = subjects.find((s) => s.id === subjectId)?.name ?? "";

  const flagDuplicates = async (list: DraftQuestion[]) => {
    if (!subjectId) return list;
    const { data: existing } = await supabase
      .from("questions")
      .select("question")
      .eq("subject_id", subjectId)
      .limit(1000);
    const seen = new Set((existing ?? []).map((q) => normalise(q.question)));
    const withinBatch = new Set<string>();
    return list.map((q) => {
      const key = normalise(q.question);
      const duplicate = seen.has(key) || withinBatch.has(key);
      withinBatch.add(key);
      return { ...q, duplicate };
    });
  };

  const callAI = async (payload: Record<string, unknown>) => {
    if (!subjectId) {
      toast({ title: "Pick a subject first", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-ai", { body: payload });
    setBusy(false);
    if (error || data?.error) {
      toast({
        title: "AI could not finish",
        description: data?.error || error?.message || "Please try again.",
        variant: "destructive",
      });
      return;
    }
    const list = await flagDuplicates((data.questions ?? []) as DraftQuestion[]);
    setDrafts((prev) => [...prev, ...list]);
    toast({ title: `${list.length} question(s) drafted`, description: "Review and edit before publishing." });
  };

  const generate = () =>
    callAI({ mode: "generate", subject: subjectName, grade, topic, difficulty, count, notes });

  const fromPhoto = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the photo"));
      reader.readAsDataURL(file);
    });
    await callAI({ mode: "photo", image: dataUrl, notes });
  };

  const updateDraft = (i: number, patch: Partial<DraftQuestion>) =>
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const publish = async () => {
    if (!subjectId || drafts.length === 0) return;
    setPublishing(true);
    const { error } = await supabase.from("questions").insert(
      drafts.map((d) => ({
        subject_id: subjectId,
        grade_id: grade,
        question: d.question.trim(),
        options: d.options.map((o) => o.trim()),
        correct_answer: d.correct_answer,
        explanation: d.explanation.trim() || null,
        difficulty: d.difficulty,
        created_by: user?.id ?? null,
      })),
    );
    setPublishing(false);
    if (error) {
      toast({ title: "Could not publish", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Published ${drafts.length} question(s)` });
    setDrafts([]);
    onPublished?.();
  };

  const duplicates = drafts.filter((d) => d.duplicate).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> AI question assistant
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Generate questions by grade, subject, topic and difficulty — or snap a photo of a past paper. Nothing is saved
          until you publish.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">Select subject…</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {["easy", "medium", "hard", "mixed"].map((d) => (
            <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>
          ))}
        </select>

        <Input placeholder="Topic (optional)" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          aria-label="How many questions"
        />
      </div>

      <Textarea
        placeholder="Extra instructions for the AI (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      <div className="flex gap-2">
        <Button onClick={generate} disabled={busy} className="flex-1">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Generate
        </Button>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void fromPhoto(f);
          }}
        />
        <Button variant="outline" disabled={busy} onClick={() => photoRef.current?.click()} className="flex-1">
          <Camera className="mr-2 h-4 w-4" /> From photo
        </Button>
      </div>

      {drafts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              {drafts.length} draft question(s)
              {duplicates > 0 && <span className="ml-2 text-destructive">· {duplicates} possible duplicate(s)</span>}
            </p>
            <button onClick={() => setConfirmDiscard(true)} className="text-[11px] text-destructive underline">
              Discard all
            </button>
          </div>

          {drafts.map((d, i) => (
            <div
              key={i}
              className={`space-y-2 rounded-xl border p-3 ${d.duplicate ? "border-destructive" : "border-border"}`}
            >
              {d.duplicate && (
                <p className="text-[11px] font-medium text-destructive">
                  Looks like a question that already exists — edit it or remove it.
                </p>
              )}
              <Textarea
                value={d.question}
                onChange={(e) => updateDraft(i, { question: e.target.value })}
                rows={2}
                aria-label={`Draft question ${i + 1}`}
              />
              {d.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`draft-${i}`}
                    checked={d.correct_answer === oi}
                    onChange={() => updateDraft(i, { correct_answer: oi })}
                    className="accent-primary"
                    aria-label={`Mark option ${String.fromCharCode(65 + oi)} correct`}
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const options = [...d.options];
                      options[oi] = e.target.value;
                      updateDraft(i, { options });
                    }}
                  />
                </div>
              ))}
              <Textarea
                value={d.explanation}
                placeholder="Explanation"
                onChange={(e) => updateDraft(i, { explanation: e.target.value })}
                rows={2}
              />
              <div className="flex items-center justify-between">
                <select
                  value={d.difficulty}
                  onChange={(e) => updateDraft(i, { difficulty: e.target.value })}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
                >
                  {["easy", "medium", "hard"].map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
                <button
                  onClick={() => setDrafts((prev) => prev.filter((_, idx) => idx !== i))}
                  className="flex items-center gap-1 text-xs text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}

          <Button onClick={publish} disabled={publishing} className="w-full">
            {publishing ? "Publishing…" : `Publish ${drafts.length} question(s) to ${subjectName || "subject"}`}
          </Button>
        </div>
      )}

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard all drafts?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the {drafts.length} unpublished draft question(s). It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep them</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDrafts([])}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAI;
