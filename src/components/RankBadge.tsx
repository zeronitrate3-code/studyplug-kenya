interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md" | "lg";
}

const RankBadge = ({ rank, size = "md" }: RankBadgeProps) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  if (rank === 1) return <span className={`inline-flex items-center justify-center rounded-full badge-gold text-primary-foreground font-bold ${sizeClasses[size]}`}>🥇</span>;
  if (rank <= 10) return <span className={`inline-flex items-center justify-center rounded-full badge-silver text-primary-foreground font-bold ${sizeClasses[size]}`}>🥈</span>;
  if (rank <= 100) return <span className={`inline-flex items-center justify-center rounded-full badge-bronze text-primary-foreground font-bold ${sizeClasses[size]}`}>🥉</span>;

  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold ${sizeClasses[size]}`}>
      #{rank}
    </span>
  );
};

export default RankBadge;
