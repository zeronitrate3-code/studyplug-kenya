import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getRankForPoints, getNextRank, getProgressToNextRank, RANK_TIERS } from "@/lib/ranks";
import RankBadge from "@/components/RankBadge";
import { ChevronDown, Trophy, Info, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LeaderboardRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  grade: number | null;
  total_points: number;
  exams_taken: number;
  avg_percentage: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "grade" | "friends">("all");
  const [grade, setGrade] = useState(7);
  const [showRanks, setShowRanks] = useState(false);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("leaderboard" as any)
        .select("*")
        .order("total_points", { ascending: false })
        .limit(100);
      if (active) {
        if (!error && data) setRows(data as unknown as LeaderboardRow[]);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Fetch accepted friend IDs for the friends-only tab
  useEffect(() => {
    if (!user) { setFriendIds(new Set()); return; }
    (async () => {
      const { data } = await supabase
        .from("friendships")
        .select("requester_id,addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      const ids = new Set<string>();
      data?.forEach((f) => {
        ids.add(f.requester_id === user.id ? f.addressee_id : f.requester_id);
      });
      ids.add(user.id); // include self in friends leaderboard
      setFriendIds(ids);
    })();
  }, [user]);

  const students = (() => {
    let list = rows;
    if (filter === "grade") list = list.filter((s) => s.grade === grade);
    else if (filter === "friends") list = list.filter((s) => friendIds.has(s.user_id));
    return list.filter((s) => s.exams_taken > 0 || s.user_id === user?.id);
  })();

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        </div>
        <button onClick={() => setShowRanks(!showRanks)} className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Info className="h-3.5 w-3.5" /> Ranks
        </button>
      </div>

      {showRanks && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-2">🏅 Rank Tiers</h3>
          {RANK_TIERS.map((tier) => (
            <div key={tier.name} className="flex items-center gap-3">
              <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm ${tier.color}`}>{tier.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{tier.name}</p>
                <p className="text-[10px] text-muted-foreground">{tier.minPoints}+ pts — {tier.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {(["all", "grade", "friends"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-colors ${
              filter === f ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f === "all" ? "Global" : f === "grade" ? "By Grade" : "Friends"}
          </button>
        ))}
      </div>

      {filter === "grade" && (
        <div className="relative inline-block">
          <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm font-medium text-foreground">
            {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Grade {i + 1}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}

      {!loading && students.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm font-semibold text-foreground">No results yet</p>
          <p className="text-xs text-muted-foreground mt-1">Take an exam to appear on the leaderboard!</p>
        </div>
      )}

      {!loading && students.length >= 3 && (
        <div className="flex items-end justify-center gap-4 pt-4">
          {[students[1], students[0], students[2]].map((s, i) => {
            const pos = [2, 1, 3][i];
            const heights = ["h-20", "h-28", "h-16"];
            const rank = getRankForPoints(s.total_points);
            const name = s.display_name || "Student";
            return (
              <div key={s.user_id} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm mb-1 overflow-hidden">
                  {s.avatar_url ? <img src={s.avatar_url} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
                </div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[80px] text-center">{name.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{rank.icon} {rank.name}</p>
                <p className="text-xs text-muted-foreground">{s.total_points} pts</p>
                <div className={`${heights[i]} w-20 rounded-t-lg mt-2 flex items-center justify-center ${
                  pos === 1 ? "badge-gold" : pos === 2 ? "badge-silver" : "badge-bronze"
                }`}>
                  <span className="text-2xl">{pos === 1 ? "🥇" : pos === 2 ? "🥈" : "🥉"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {students.map((s, i) => {
          const rank = getRankForPoints(s.total_points);
          const nextRank = getNextRank(s.total_points);
          const progress = getProgressToNextRank(s.total_points);
          const name = s.display_name || "Student";
          const isMe = s.user_id === user?.id;
          return (
            <div key={s.user_id} className={`rounded-xl border p-3 shadow-sm space-y-2 ${isMe ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <div className="flex items-center gap-3">
                <RankBadge rank={i + 1} />
                <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-xs overflow-hidden">
                  {s.avatar_url ? <img src={s.avatar_url} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground truncate">
                    {name} {isMe && <span className="text-[10px] text-primary">(You)</span>}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${rank.color}`}>
                      {rank.icon} {rank.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">• Grade {s.grade ?? "-"} • {s.exams_taken} exams</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{s.total_points}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
              {nextRank && (
                <div className="flex items-center gap-2 ml-11">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{nextRank.icon} {nextRank.minPoints - s.total_points} to go</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
