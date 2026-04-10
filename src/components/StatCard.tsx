interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: "primary" | "secondary" | "accent" | "success";
}

const colorMap = {
  primary: "gradient-primary text-primary-foreground",
  secondary: "gradient-warm text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
};

const StatCard = ({ icon, label, value, color = "primary" }: StatCardProps) => (
  <div className={`rounded-xl p-4 ${colorMap[color]} shadow-sm`}>
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xl font-bold">{value}</div>
    <div className="text-xs opacity-80">{label}</div>
  </div>
);

export default StatCard;
