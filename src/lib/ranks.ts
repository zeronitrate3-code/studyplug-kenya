export interface RankTier {
  name: string;
  minPoints: number;
  icon: string;
  color: string;
  description: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: "Beginner", minPoints: 0, icon: "🌱", color: "bg-muted text-muted-foreground", description: "Just getting started" },
  { name: "Learner", minPoints: 100, icon: "📖", color: "bg-primary/10 text-primary", description: "Building knowledge" },
  { name: "Explorer", minPoints: 300, icon: "🔍", color: "bg-primary/20 text-primary", description: "Exploring new topics" },
  { name: "Scholar", minPoints: 600, icon: "🎓", color: "bg-accent/20 text-accent", description: "Dedicated student" },
  { name: "Achiever", minPoints: 1000, icon: "⭐", color: "bg-warning/20 text-warning", description: "Consistent performer" },
  { name: "Expert", minPoints: 1500, icon: "💡", color: "bg-secondary/20 text-secondary", description: "Subject expert" },
  { name: "Master", minPoints: 2000, icon: "🏅", color: "badge-silver text-primary-foreground", description: "Mastering all subjects" },
  { name: "Champion", minPoints: 2500, icon: "🏆", color: "badge-gold text-primary-foreground", description: "Top-tier student" },
  { name: "Legend", minPoints: 3000, icon: "👑", color: "gradient-hero text-primary-foreground", description: "StudyPlug Legend" },
];

export function getRankForPoints(points: number): RankTier {
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (points >= tier.minPoints) rank = tier;
  }
  return rank;
}

export function getNextRank(points: number): RankTier | null {
  for (const tier of RANK_TIERS) {
    if (points < tier.minPoints) return tier;
  }
  return null;
}

export function getProgressToNextRank(points: number): number {
  const current = getRankForPoints(points);
  const next = getNextRank(points);
  if (!next) return 100;
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.round((progress / range) * 100);
}
