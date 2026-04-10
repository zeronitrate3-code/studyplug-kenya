import { useState } from "react";
import { MOCK_LEADERBOARD } from "@/lib/mockData";
import RankBadge from "@/components/RankBadge";
import { ChevronDown, Trophy } from "lucide-react";

const Leaderboard = () => {
  const [filter, setFilter] = useState<"all" | "grade" | "subject">("all");
  const [grade, setGrade] = useState(7);

  const students = filter === "grade"
    ? MOCK_LEADERBOARD.filter((s) => s.grade === grade)
    : MOCK_LEADERBOARD;

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "grade", "subject"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-colors ${
              filter === f ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f === "all" ? "Global" : f === "grade" ? "By Grade" : "By Subject"}
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

      {/* Top 3 podium */}
      {students.length >= 3 && (
        <div className="flex items-end justify-center gap-4 pt-4">
          {[students[1], students[0], students[2]].map((s, i) => {
            const pos = [2, 1, 3][i];
            const heights = ["h-20", "h-28", "h-16"];
            return (
              <div key={s.id} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm mb-1">
                  {s.name.charAt(0)}
                </div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[80px] text-center">{s.name.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground">{s.totalScore} pts</p>
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

      {/* Full list */}
      <div className="space-y-2">
        {students.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
            <RankBadge rank={i + 1} />
            <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-xs">
              {s.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground truncate">{s.name}</p>
              <p className="text-xs text-muted-foreground">Grade {s.grade} • {s.accuracy}% accuracy</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{s.totalScore}</p>
              <p className="text-xs text-muted-foreground">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
