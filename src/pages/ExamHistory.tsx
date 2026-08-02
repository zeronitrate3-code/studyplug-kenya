import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchExamHistory, type HistoryRow } from "@/lib/examService";

const ExamHistory = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    let active = true;
    (async () => {
      const data = await fetchExamHistory(user.id);
      if (!active) return;
      setRows(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading, navigate]);

  return (
    <div className="animate-fade-in space-y-4 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Exam History
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">No exams yet — take your first one!</p>
          <button onClick={() => navigate("/exams")} className="rounded-xl gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
            Browse exams
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{r.subject_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()} • {r.score}/{r.total_questions} correct • +{r.points} pts
                </p>
              </div>
              <span
                className={`text-lg font-bold ${
                  r.percentage >= 80 ? "text-success" : r.percentage >= 60 ? "text-warning" : "text-destructive"
                }`}
              >
                {r.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamHistory;
