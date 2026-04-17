import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubjectGroupsForGrade } from "@/lib/mockData";
import SubjectCard from "@/components/SubjectCard";
import StatCard from "@/components/StatCard";
import logo from "@/assets/logo.png";
import { ChevronDown, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ExamRow {
  id: string;
  subject_id: string;
  subject_name: string;
  percentage: number;
  points: number;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [grade, setGrade] = useState<number>(profile?.grade ?? 7);
  const [results, setResults] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.grade) setGrade(profile.grade);
  }, [profile?.grade]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("exam_results")
        .select("id, subject_id, subject_name, percentage, points, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setResults(data ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleGradeChange = async (newGrade: number) => {
    setGrade(newGrade);
    if (user) {
      await supabase.from("profiles").update({ grade: newGrade }).eq("user_id", user.id);
      refreshProfile();
    }
  };

  const totalPoints = results.reduce((s, r) => s + (r.points ?? 0), 0);
  const examsDone = results.length;
  const accuracy = examsDone > 0
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / examsDone)
    : 0;

  const greetingName =
    profile?.display_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Student";

  const subjectGroups = getSubjectGroupsForGrade(grade);
  const recent = results.slice(0, 5);

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="StudyPlug" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Hi, {greetingName.split(" ")[0]}! 👋</h1>
            <p className="text-xs text-muted-foreground">Ready to learn today?</p>
          </div>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🏆" label="Total Points" value={totalPoints} color="primary" />
        <StatCard icon="📝" label="Exams Done" value={examsDone} color="secondary" />
        <StatCard icon="🎯" label="Accuracy" value={`${accuracy}%`} color="accent" />
        <StatCard icon="⭐" label="Rank Points" value={totalPoints} color="success" />
      </div>

      {/* Install Banner */}
      <button
        onClick={() => navigate("/install")}
        className="w-full rounded-xl gradient-hero p-4 flex items-center gap-3 text-left shadow-md"
      >
        <Download className="h-8 w-8 text-primary-foreground shrink-0" />
        <div>
          <p className="text-sm font-semibold text-primary-foreground">Install StudyPlug App</p>
          <p className="text-xs text-primary-foreground/70">Add to home screen for the best experience</p>
        </div>
      </button>

      {/* Subjects by pathway */}
      {subjectGroups.map((group) => (
        <div key={group.title}>
          <h2 className="text-lg font-semibold text-foreground mb-3">{group.title}</h2>
          <div className="grid grid-cols-3 gap-3">
            {group.subjects.map((subject) => (
              <SubjectCard key={subject.id} id={subject.id} name={subject.name} icon={subject.icon} grade={grade} />
            ))}
          </div>
        </div>
      ))}

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Exams</h2>
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading…</div>
        ) : recent.length === 0 ? (
          <button
            onClick={() => navigate("/exams")}
            className="w-full rounded-xl border border-dashed border-border bg-card p-6 text-center"
          >
            <p className="text-sm font-medium text-card-foreground">No exams yet</p>
            <p className="text-xs text-muted-foreground mt-1">Take your first one to start earning points!</p>
          </button>
        ) : (
          <div className="space-y-2">
            {recent.map((result) => (
              <div key={result.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{result.subject_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${result.percentage >= 80 ? "text-success" : result.percentage >= 60 ? "text-warning" : "text-destructive"}`}>
                  {result.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
