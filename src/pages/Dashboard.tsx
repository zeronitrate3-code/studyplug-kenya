import { useState } from "react";
import { CORE_SUBJECTS, SPORTS_SUBJECTS, ARTS_SUBJECTS, ELECTIVE_SUBJECTS, CURRENT_USER, MOCK_RESULTS, SUBJECTS } from "@/lib/mockData";
import SubjectCard from "@/components/SubjectCard";
import StatCard from "@/components/StatCard";
import logo from "@/assets/logo.png";
import { ChevronDown } from "lucide-react";

const Dashboard = () => {
  const [grade, setGrade] = useState(CURRENT_USER.grade);

  const subjectGroups = [
    { title: "📘 Core Subjects", subjects: CORE_SUBJECTS },
    { title: "🏅 Sports Science", subjects: SPORTS_SUBJECTS },
    { title: "🎨 Arts Pathway", subjects: ARTS_SUBJECTS },
    { title: "📚 Electives", subjects: ELECTIVE_SUBJECTS },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="StudyPlug" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Hi, {CURRENT_USER.name.split(" ")[0]}! 👋</h1>
            <p className="text-xs text-muted-foreground">Ready to learn today?</p>
          </div>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🏆" label="Total Points" value={CURRENT_USER.totalScore} color="primary" />
        <StatCard icon="📝" label="Exams Done" value={CURRENT_USER.examsCompleted} color="secondary" />
        <StatCard icon="🎯" label="Accuracy" value={`${CURRENT_USER.accuracy}%`} color="accent" />
        <StatCard icon="⭐" label="Rank Points" value={CURRENT_USER.rankPoints} color="success" />
      </div>

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
        <div className="space-y-2">
          {MOCK_RESULTS.map((result) => {
            const subject = SUBJECTS.find((s) => s.id === result.subject);
            return (
              <div key={result.examId} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{subject?.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{subject?.name}</p>
                    <p className="text-xs text-muted-foreground">{result.dateTaken}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${result.percentage >= 80 ? "text-success" : result.percentage >= 60 ? "text-warning" : "text-destructive"}`}>
                  {result.percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
