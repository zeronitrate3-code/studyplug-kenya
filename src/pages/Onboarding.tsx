import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, GraduationCap, Loader2 } from "lucide-react";
import {
  GRADE_OPTIONS,
  JUNIOR_SUBJECTS,
  PATHWAYS,
  SENIOR_COMPULSORY,
  isJuniorGrade,
  isSeniorGrade,
  type PathwayId,
} from "@/lib/curriculum";
import logo from "@/assets/logo.png";

type Step = "grade" | "pathway" | "subjects";

const Onboarding = () => {
  const { user, profile, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const isEdit = params.get("edit") === "1";

  const [step, setStep] = useState<Step>("grade");
  const [grade, setGrade] = useState<number | null>(null);
  const [pathway, setPathway] = useState<PathwayId | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!isEdit || !profile) return;
    setGrade(profile.grade ?? null);
    setPathway((profile.pathway as PathwayId) ?? null);
    setSelected(profile.selected_subjects ?? []);
  }, [isEdit, profile]);

  const pathwayDef = useMemo(() => PATHWAYS.find((p) => p.id === pathway), [pathway]);

  const compulsory = isJuniorGrade(grade) ? JUNIOR_SUBJECTS : SENIOR_COMPULSORY;
  const optional = isSeniorGrade(grade) ? pathwayDef?.optional ?? [] : [];

  const chooseGrade = (g: number) => {
    setGrade(g);
    if (isJuniorGrade(g)) {
      setPathway(null);
      setSelected(JUNIOR_SUBJECTS.map((s) => s.id));
      setStep("subjects");
    } else {
      setStep("pathway");
    }
  };

  const choosePathway = (id: PathwayId) => {
    setPathway(id);
    setSelected((prev) => {
      const compulsoryIds = SENIOR_COMPULSORY.map((s) => s.id);
      const allowed = PATHWAYS.find((p) => p.id === id)?.optional.map((s) => s.id) ?? [];
      const keptOptions = prev.filter((s) => allowed.includes(s));
      return Array.from(new Set([...compulsoryIds, ...keptOptions]));
    });
    setStep("subjects");
  };

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const optionalCount = selected.filter((s) => optional.some((o) => o.id === s)).length;

  const save = async () => {
    if (!user || !grade) return;
    if (isSeniorGrade(grade) && optionalCount === 0) {
      toast({ title: "Choose your subjects", description: "Pick at least one optional subject.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        grade,
        pathway: isSeniorGrade(grade) ? pathway : null,
        selected_subjects: Array.from(new Set([...compulsory.map((s) => s.id), ...selected])),
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Subjects saved!", description: "Your learning space is personalised." });
    navigate(isEdit ? "/profile" : "/");
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background px-4 pb-28 pt-6">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          {step !== "grade" && (
            <button
              onClick={() => setStep(step === "subjects" && isSeniorGrade(grade) ? "pathway" : "grade")}
              className="rounded-lg border border-border bg-card p-2"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </button>
          )}
          <img src={logo} alt="StudyPlug Kenya" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEdit ? "Edit your subjects" : "Set up your learning"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {step === "grade" && "Which grade are you in?"}
              {step === "pathway" && "Choose your senior school pathway"}
              {step === "subjects" && "Confirm the subjects you study"}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5">
          {["grade", "pathway", "subjects"].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s === step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === "grade" && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {GRADE_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => chooseGrade(g)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                  grade === g ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-card-foreground">Grade {g}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {isJuniorGrade(g) ? "Junior School" : "Senior School"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "pathway" && (
          <div className="space-y-3 animate-fade-in">
            {PATHWAYS.map((p) => (
              <button
                key={p.id}
                onClick={() => choosePathway(p.id)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                  pathway === p.id ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span className="text-3xl">{p.icon}</span>
                <div className="flex-1">
                  <p className="text-base font-semibold text-card-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.blurb}</p>
                </div>
                {pathway === p.id && <Check className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        )}

        {step === "subjects" && (
          <div className="space-y-6 animate-fade-in">
            <section>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                {isJuniorGrade(grade) ? "Your Junior School subjects" : "Compulsory subjects"}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {compulsory.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 p-3"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-xs font-medium text-card-foreground">{s.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {optional.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  {pathwayDef?.name} optional subjects{" "}
                  <span className="text-xs font-normal text-muted-foreground">({optionalCount} chosen)</span>
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {optional.map((s) => {
                    const active = selected.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggle(s.id)}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all active:scale-95 ${
                          active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"
                        }`}
                      >
                        <span className="text-xl">{s.icon}</span>
                        <span className="flex-1 text-xs font-medium text-card-foreground">{s.name}</span>
                        {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save my subjects"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
