import { CURRENT_USER, MOCK_RESULTS, SUBJECTS } from "@/lib/mockData";
import RankBadge from "@/components/RankBadge";
import { Settings, Bell, Shield, LogOut, HelpCircle, ChevronRight } from "lucide-react";

const Profile = () => {
  const settingsItems = [
    { icon: Settings, label: "Change Grade", desc: `Currently Grade ${CURRENT_USER.grade}` },
    { icon: Bell, label: "Notifications", desc: "Manage alerts" },
    { icon: Shield, label: "Privacy Controls", desc: "Data & privacy" },
    { icon: HelpCircle, label: "Help & FAQ", desc: "Get support" },
    { icon: LogOut, label: "Log Out", desc: "Sign out", destructive: true },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Profile Card */}
      <div className="rounded-2xl gradient-hero p-6 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
            {CURRENT_USER.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{CURRENT_USER.name}</h1>
            <p className="text-sm opacity-80">Grade {CURRENT_USER.grade}</p>
          </div>
          <RankBadge rank={15} size="lg" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 text-center">
          <div>
            <p className="text-lg font-bold">{CURRENT_USER.totalScore}</p>
            <p className="text-xs opacity-80">Points</p>
          </div>
          <div>
            <p className="text-lg font-bold">{CURRENT_USER.examsCompleted}</p>
            <p className="text-xs opacity-80">Exams</p>
          </div>
          <div>
            <p className="text-lg font-bold">{CURRENT_USER.accuracy}%</p>
            <p className="text-xs opacity-80">Accuracy</p>
          </div>
        </div>
      </div>

      {/* Exam History */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Exam History</h2>
        <div className="space-y-2">
          {MOCK_RESULTS.map((result) => {
            const subject = SUBJECTS.find((s) => s.id === result.subject);
            return (
              <div key={result.examId} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{subject?.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{subject?.name}</p>
                    <p className="text-xs text-muted-foreground">{result.dateTaken}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${result.percentage >= 80 ? "text-success" : result.percentage >= 60 ? "text-warning" : "text-destructive"}`}>
                  {result.score}/{result.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Settings</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {settingsItems.map((item, i) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted ${
                i < settingsItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.destructive ? "text-destructive" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.destructive ? "text-destructive" : "text-card-foreground"}`}>{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
