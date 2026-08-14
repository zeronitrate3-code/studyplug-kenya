import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { SUBJECTS } from "@/lib/mockData";
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queueExamResult } from "@/lib/offlineQueue";
import { loadExamQuestions, submitExam, type ExamQuestion } from "@/lib/examService";

type Phase = "loading" | "intro" | "active" | "results";

const ExamTaking = () => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const grade = Number(searchParams.get("grade")) || 7;

  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const { user } = useAuth();
  const { toast } = useToast();
  const savedRef = useRef(false);

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);

  // Load questions ONCE per mount (never during timer ticks).
  useEffect(() => {
    let active = true;
    (async () => {
      const qs = await loadExamQuestions(subjectId || "", user?.id ?? null);
      if (!active) return;
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      const limit = qs.length * 120; // 2 min per question
      setTimeLimit(limit);
      setTimeLeft(limit);
      setPhase("intro");
    })();
    return () => {
      active = false;
    };
  }, [subjectId, user?.id]);

  useEffect(() => {
    if (phase !== "active") return;
    if (timeLeft <= 0) {
      setPhase("results");
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  const selectAnswer = useCallback(
    (idx: number) => {
      setAnswers((prev) => {
        const n = [...prev];
        n[currentQ] = idx;
        return n;
      });
    },
    [currentQ]
  );

  // Correct answers only exist locally for the offline bank; online exams get
  // them back from the server after the attempt is marked.
  const correctFor = useCallback(
    (q: ExamQuestion) => review[q.id]?.correct ?? q.correctAnswer,
    [review]
  );

  const localScore = answers.reduce<number>(
    (acc, ans, i) => acc + (questions[i] && ans === correctFor(questions[i]) ? 1 : 0),
    0
  );
  const score = serverScore ?? localScore;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const points = score * 10;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  useEffect(() => {
    if (phase !== "results" || savedRef.current || !user || questions.length === 0) return;
    savedRef.current = true;
    (async () => {
      const offlinePayload = {
        user_id: user.id,
        subject_id: subjectId || "",
        subject_name: subject?.name || subjectId || "Exam",
        grade,
        score: localScore,
        total_questions: questions.length,
        percentage: Math.round((localScore / questions.length) * 100),
        points: localScore * 10,
        created_at: new Date().toISOString(),
      };

      if (!navigator.onLine) {
        queueExamResult(offlinePayload);
        toast({ title: "Saved offline", description: "This result will upload once you're back online." });
        return;
      }

      const { error, result } = await submitExam({
        userId: user.id,
        subjectId: subjectId || "",
        subjectName: subject?.name || subjectId || "Exam",
        grade,
        questions,
        answers,
        timeTakenSeconds: Math.max(0, timeLimit - timeLeft),
      });

      if (error || !result) {
        queueExamResult(offlinePayload);
        toast({ title: "Saved offline", description: "Couldn't reach the server — we'll upload it later." });
      } else {
        const map: Record<string, { correct: number | null; explanation: string }> = {};
        (result.review ?? []).forEach((r) => {
          map[r.question_id] = { correct: r.correct_answer, explanation: r.explanation };
        });
        setReview(map);
        setServerScore(result.score);
        toast({ title: "Result saved!", description: `+${result.points} points added to your rank.` });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, user, subjectId, grade, questions.length]);


  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <span className="text-5xl mb-4">🚧</span>
        <h1 className="text-2xl font-bold text-foreground mb-2">Coming Soon!</h1>
        <p className="text-muted-foreground mb-6">Questions for {subject?.name || "this subject"} are being prepared. Check back soon!</p>
        <button onClick={() => navigate(-1)} className="rounded-xl gradient-primary px-8 py-3 text-primary-foreground font-semibold shadow-lg">
          ← Go Back
        </button>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <span className="text-5xl mb-4">{subject?.icon || "📝"}</span>
        <h1 className="text-2xl font-bold text-foreground mb-2">{subject?.name || "Exam"} - Grade {grade}</h1>
        <p className="text-muted-foreground mb-1">{questions.length} questions • {Math.floor(timeLimit / 60)} minutes</p>
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
          <p className="text-muted-foreground">{score}/{questions.length} correct</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Review Answers</h2>
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctAnswer;
            return (
              <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-7">
                  {!isCorrect && <>Your answer: <span className="text-destructive font-medium">{answers[i] === null ? "—" : q.options[answers[i] as number]}</span> • </>}
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

  const q = questions[currentQ];

  return (
    <div className="animate-fade-in min-h-screen flex flex-col px-4 pt-4 pb-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
          <Clock className={`h-4 w-4 ${timeLeft < 60 ? "text-destructive" : "text-muted-foreground"}`} />
          <span className={`text-sm font-mono font-semibold ${timeLeft < 60 ? "text-destructive" : "text-foreground"}`}>
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-6">
        {questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
            i === currentQ ? "gradient-primary" : answers[i] !== null ? "bg-primary/40" : "bg-muted"
          }`} />
        ))}
      </div>

      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-1">Question {currentQ + 1} of {questions.length}</p>
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

      <div className="flex gap-3 mt-6">
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground">
            Previous
          </button>
        )}
        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="flex-1 rounded-xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-md"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setPhase("results")}
            className="flex-1 rounded-xl gradient-warm py-3 text-sm font-semibold text-primary-foreground shadow-md"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamTaking;
