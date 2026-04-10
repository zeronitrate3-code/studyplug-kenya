import { useNavigate } from "react-router-dom";

interface SubjectCardProps {
  id: string;
  name: string;
  icon: string;
  grade: number;
}

const SubjectCard = ({ id, name, icon, grade }: SubjectCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/exam/${id}?grade=${grade}`)}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-medium text-card-foreground">{name}</span>
    </button>
  );
};

export default SubjectCard;
