import { useEffect, useState } from "react";
import { SUBJECTS, getSubjectGroupsForGrade } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Play, History, BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const GRADE_KEY = "studyplug:selectedGrade";

const SubjectRow = ({ subject, grade, navigate }: { subject: { id: string; name: string; icon: string }; grade: number; navigate: ReturnType<typeof useNavigate> }) => (
  <button
    onClick={() => navigate(`/exam/${subject.id}?grade=${grade}`)}
    className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl">{subject.icon}</span>
      <div className="text-left">
        <p className="text-sm font-semibold text-card-foreground">{subject.name}</p>
        <p className="text-xs text-muted-foreground">Grade {grade} • 5 Questions • 10 min</p>
      </div>
    </div>
    <div className="flex items-center gap-1 rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
      <Play className="h-3 w-3" /> Start
    </div>
  </button>
);

interface PastExam {
  id: string;
  subject_id: string;
  subject_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}

const Exams = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Initialize from localStorage → profile → 7
  const [grade, setGrade] = useState<number>(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(GRADE_KEY) : null;
    return stored ? Number(stored) : 7;
  });
  const [pastExams, setPastExams] = useState<PastExam[]>([]);

  // Once profile loads, prefer its grade if user hasn't picked locally yet
  useEffect(() => {
    const stored = localStorage.getItem(GRADE_KEY);
    if (!stored && profile?.grade) setGrade(profile.grade);
  }, [profile?.grade]);

  // Persist grade to localStorage AND profile when it changes
  const handleGradeChange = async (newGrade: number) => {
    setGrade(newGrade);
    localStorage.setItem(GRADE_KEY, String(newGrade));
    if (user) {
      await supabase.from("profiles").update({ grade: newGrade }).eq("user_id", user.id);
      refreshProfile();
    }
  };

  // Fetch user's real past exams
  useEffect(() => {
    if (!user) { setPastExams([]); return; }
    (async () => {
      const { data } = await supabase
        .from("exam_results")
        .select("id,subject_id,subject_name,score,total_questions,percentage,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setPastExams(data);
    })();
  }, [user]);

  const subjectGroups = getSubjectGroupsForGrade(grade);

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Exams</h1>
        <div className="relative">
          <select
            value={grade}
            onChange={(e) => handleGradeChange(Number(e.target.value))}
            className="appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm font-medium text-foreground shadow-sm"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {subjectGroups.map((group) => (
        <div key={group.title}>
          <h2 className="text-base font-semibold text-foreground mb-2">{group.title}</h2>
          <div className="space-y-2">
            {group.subjects.map((subject) => (
              <SubjectRow key={subject.id} subject={subject} grade={grade} navigate={navigate} />
            ))}
          </div>
        </div>
      ))}

      {/* Exam History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Past Exams</h2>
        </div>
        <div className="space-y-2">
          {pastExams.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">No exams yet — take one above to see your history here!</p>
            </div>
          )}
          {pastExams.map((result) => {
            const subject = SUBJECTS.find((s) => s.id === result.subject_id);
            const dateLabel = new Date(result.created_at).toLocaleDateString();
            return (
              <div key={result.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{subject?.icon ?? "📘"}</span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{result.subject_name}</p>
                    <p className="text-xs text-muted-foreground">{dateLabel} • {result.score}/{result.total_questions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  <span className={`text-sm font-bold ${result.percentage >= 80 ? "text-success" : result.percentage >= 60 ? "text-warning" : "text-destructive"}`}>
                    {result.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Exams;
