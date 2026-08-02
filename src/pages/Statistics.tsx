import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fetchExamHistory, type HistoryRow } from "@/lib/examService";

interface Badge {
  achievement_id: string;
  name: string;
  icon: string;
  description: string;
}

const Statistics = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    let active = true;
    (async () => {
      const [history, { data: earned }] = await Promise.all([
        fetchExamHistory(user.id),
        supabase
          .from("user_achievements")
          .select("achievement_id, achievements(name,icon,description)")
          .eq("user_id", user.id),
      ]);
      if (!active) return;
      setRows(history);
      setBadges(
        (earned ?? []).map((e: any) => ({
          achievement_id: e.achievement_id,
          name: e.achievements?.name ?? e.achievement_id,
          icon: e.achievements?.icon ?? "🏅",
          description: e.achievements?.description ?? "",
        }))
      );
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading, navigate]);

  const stats = useMemo(() => {
    const total = rows.length;
    const points = rows.reduce((a, r) => a + r.points, 0);
    const avg = total ? Math.round(rows.reduce((a, r) => a + r.percentage, 0) / total) : 0;
    const best = total ? Math.max(...rows.map((r) => r.percentage)) : 0;

    const bySubject = new Map<string, { name: string; count: number; sum: number }>();
    rows.forEach((r) => {
      const cur = bySubject.get(r.subject_id) ?? { name: r.subject_name, count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += r.percentage;
      bySubject.set(r.subject_id, cur);
    });

    const subjects = [...bySubject.entries()]
      .map(([id, v]) => ({ id, name: v.name, count: v.count, avg: Math.round(v.sum / v.count) }))
      .sort((a, b) => b.avg - a.avg);

    return { total, points, avg, best, subjects };
  }, [rows]);

  return (
    <div className="animate-fade-in space-y-5 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Statistics
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Exams done", value: stats.total },
              { label: "Total points", value: stats.points },
              { label: "Average score", value: `${stats.avg}%` },
              { label: "Best score", value: `${stats.best}%` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Performance by subject</h2>
            {stats.subjects.length === 0 ? (
              <p className="text-xs text-muted-foreground">Take an exam to see your subject breakdown.</p>
            ) : (
              stats.subjects.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-muted-foreground">{s.avg}% • {s.count} exam{s.count > 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full gradient-primary" style={{ width: `${s.avg}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Badges earned</h2>
            {badges.length === 0 ? (
              <p className="text-xs text-muted-foreground">No badges yet — complete exams to unlock them.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <div key={b.achievement_id} className="rounded-xl border border-border px-3 py-2" title={b.description}>
                    <span className="mr-1">{b.icon}</span>
                    <span className="text-xs font-medium text-foreground">{b.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;
