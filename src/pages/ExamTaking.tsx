import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MOCK_EXAM } from "@/lib/mockData";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";

type Phase = "intro" | "active" | "results";

const ExamTaking = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const exam = MOCK_EXAM; // In production, fetch by subjectId + grade

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(exam.questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit);

  useEffect(() => {
    if (phase !== "active") return;
    if (timeLeft <= 0) { setPhase("results"); return; }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  const selectAnswer = useCallback((idx: number) => {
    setAnswers((prev) => { const n = [...prev]; n[currentQ] = idx; return n; });
  }, [currentQ]);

  const score = answers.reduce<number>((acc, ans, i) => acc + (ans === exam.questions[i].correctAnswer ? 1 : 0), 0);
  const percentage = Math.round((score / exam.questions.length) * 100);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (phase === "intro") {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <span className="text-5xl mb-4">📝</span>
        <h1 className="text-2xl font-bold text-foreground mb-2">{exam.title}</h1>
        <p className="text-muted-foreground mb-1">{exam.questions.length} questions • {Math.floor(exam.timeLimit / 60)} minutes</p>
        <p className="text-sm text-muted-foreground mb-8">Answer all questions before time runs out!</p>
        <button onClick={() => setPhase("active")} className="rounded-xl gradient-primary px-8 py-3 text-primary-foreground font-semibold shadow-lg animate-pulse-glow">
          Start Exam
        </button>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-muted-foreground">← Go Back</button>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="animate-slide-up space-y-6 pb-24 px-4 pt-6 max-w-lg mx-auto">
        <div className="text-center">
          <span className="text-5xl">{percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📚"}</span>
          <h1 className="text-2xl font-bold text-foreground mt-2">Exam Complete!</h1>
          <div className={`text-4xl font-bold mt-2 ${percentage >= 80 ? "text-success" : percentage >= 60 ? "text-warning" : "text-destructive"}`}>
            {percentage}%
          </div>
          <p className="text-muted-foreground">{score}/{exam.questions.length} correct</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Review Answers</h2>
          {exam.questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctAnswer;
            return (
              <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-7">
                  {!isCorrect && <>Your answer: <span className="text-destructive font-medium">{q.options[answers[i] ?? 0]}</span> • </>}
                  Correct: <span className="text-success font-medium">{q.options[q.correctAnswer]}</span>
                </p>
                <p className="text-xs text-muted-foreground ml-7 mt-1 italic">{q.explanation}</p>
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate("/exams")} className="w-full rounded-xl gradient-primary py-3 text-primary-foreground font-semibold shadow-md">
          Back to Exams
        </button>
      </div>
    );
  }

  const q = exam.questions[currentQ];

  return (
    <div className="animate-fade-in min-h-screen flex flex-col px-4 pt-4 pb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
          <Clock className={`h-4 w-4 ${timeLeft < 60 ? "text-destructive" : "text-muted-foreground"}`} />
          <span className={`text-sm font-mono font-semibold ${timeLeft < 60 ? "text-destructive" : "text-foreground"}`}>
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {exam.questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
            i === currentQ ? "gradient-primary" : answers[i] !== null ? "bg-primary/40" : "bg-muted"
          }`} />
        ))}
      </div>

      {/* Question */}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1">Question {currentQ + 1} of {exam.questions.length}</p>
        <h2 className="text-xl font-bold text-foreground mb-6">{q.question}</h2>

        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition-all ${
                answers[currentQ] === i
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card text-card-foreground hover:border-primary/40"
              }`}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current mr-3 text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground">
            Previous
          </button>
        )}
        {currentQ < exam.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="flex-1 rounded-xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-md"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setPhase("results")}
            className="flex-1 rounded-xl gradient-warm py-3 text-sm font-semibold text-secondary-foreground shadow-md"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamTaking;
