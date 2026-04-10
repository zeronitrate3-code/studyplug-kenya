import { useState } from "react";
import { SUBJECTS, MOCK_RESULTS } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Play, History, BarChart2 } from "lucide-react";

const Exams = () => {
  const [grade, setGrade] = useState(7);
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Exams</h1>
        <div className="relative">
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm font-medium text-foreground shadow-sm"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Start new exam */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Start New Exam</h2>
        <div className="space-y-2">
          {SUBJECTS.map((subject) => (
            <button
              key={subject.id}
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
          ))}
        </div>
      </div>

      {/* Exam History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Past Exams</h2>
        </div>
        <div className="space-y-2">
          {MOCK_RESULTS.map((result) => {
            const subject = SUBJECTS.find((s) => s.id === result.subject);
            return (
              <div key={result.examId} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{subject?.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{subject?.name}</p>
                    <p className="text-xs text-muted-foreground">{result.dateTaken} • {result.score}/{result.total}</p>
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
