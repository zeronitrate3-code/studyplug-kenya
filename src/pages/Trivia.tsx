import { useState, useEffect, useCallback } from "react";
import { Trophy, Timer, Zap, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  { question: "What is the capital of Kenya?", options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"], correctAnswer: 1, category: "🌍 Geography" },
  { question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], correctAnswer: 0, category: "🧪 Science" },
  { question: "What is 15 × 12?", options: ["160", "170", "180", "190"], correctAnswer: 2, category: "📐 Math" },
  { question: "Who wrote 'Things Fall Apart'?", options: ["Wole Soyinka", "Chinua Achebe", "Ngugi wa Thiong'o", "Chimamanda Adichie"], correctAnswer: 1, category: "📚 Literature" },
  { question: "What is the largest planet in our solar system?", options: ["Saturn", "Neptune", "Jupiter", "Uranus"], correctAnswer: 2, category: "🔬 Science" },
  { question: "Mount Kenya is the ___ highest mountain in Africa.", options: ["1st", "2nd", "3rd", "4th"], correctAnswer: 1, category: "🌍 Geography" },
  { question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nuclear Acid", "Dual Nucleotide Acid"], correctAnswer: 0, category: "🧬 Biology" },
  { question: "Solve: 3x + 7 = 22. What is x?", options: ["3", "4", "5", "6"], correctAnswer: 2, category: "📐 Math" },
  { question: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: 2, category: "🧬 Biology" },
  { question: "Kenya gained independence in which year?", options: ["1960", "1963", "1964", "1965"], correctAnswer: 1, category: "🏛️ History" },
  { question: "What is the Kiswahili word for 'freedom'?", options: ["Uhuru", "Amani", "Umoja", "Harambee"], correctAnswer: 0, category: "🗣️ Kiswahili" },
  { question: "What is the boiling point of water in °C?", options: ["90", "95", "100", "110"], correctAnswer: 2, category: "🧪 Science" },
];

const ROUND_SIZE = 5;
const TIME_PER_QUESTION = 15;

const Trivia = () => {
  const [gameState, setGameState] = useState<"menu" | "playing" | "results">("menu");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(TIME_PER_QUESTION);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const startGame = () => {
    const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, ROUND_SIZE);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimer(TIME_PER_QUESTION);
    setGameState("playing");
  };

  const handleAnswer = useCallback((index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === questions[currentIndex].correctAnswer;
    if (correct) {
      setScore((s) => s + (10 + timer));
      setStreak((s) => {
        const newStreak = s + 1;
        setBestStreak((b) => Math.max(b, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setTimer(TIME_PER_QUESTION);
      } else {
        setGameState("results");
      }
    }, 1200);
  }, [selected, currentIndex, questions, timer]);

  useEffect(() => {
    if (gameState !== "playing" || selected !== null) return;
    if (timer <= 0) {
      handleAnswer(-1);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [gameState, timer, selected, handleAnswer]);

  if (gameState === "menu") {
    return (
      <div className="animate-fade-in pb-24 px-4 pt-6 max-w-lg mx-auto text-center space-y-6">
        <div className="space-y-2">
          <div className="text-5xl">🧠</div>
          <h1 className="text-2xl font-bold text-foreground">StudyPlug Trivia</h1>
          <p className="text-muted-foreground">Test your knowledge with quick trivia rounds!</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-left">
          <div className="flex items-center gap-3"><Timer className="h-5 w-5 text-primary" /><span className="text-sm text-card-foreground">{TIME_PER_QUESTION} seconds per question</span></div>
          <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-warning" /><span className="text-sm text-card-foreground">Bonus points for speed</span></div>
          <div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-accent" /><span className="text-sm text-card-foreground">Build streaks for glory</span></div>
        </div>
        <Button onClick={startGame} size="lg" className="w-full text-lg py-6">
          Start Trivia Round <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  if (gameState === "results") {
    const correct = questions.filter((q, i) => {
      // We need to track answers to calculate this properly
      return false; // Placeholder
    }).length;
    return (
      <div className="animate-fade-in pb-24 px-4 pt-6 max-w-lg mx-auto text-center space-y-6">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold text-foreground">Round Complete!</h1>
        <div className="rounded-2xl gradient-hero p-6 text-primary-foreground">
          <p className="text-4xl font-bold">{score}</p>
          <p className="text-sm opacity-80">Total Points</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-lg font-bold text-foreground">{bestStreak}🔥</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-lg font-bold text-foreground">{ROUND_SIZE}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={startGame} className="flex-1"><RotateCcw className="mr-2 h-4 w-4" /> Play Again</Button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="animate-fade-in pb-24 px-4 pt-6 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
        <div className="flex items-center gap-1 text-sm font-bold text-foreground">
          <Trophy className="h-4 w-4 text-primary" /> {score}
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${timer <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>
          <Timer className="h-4 w-4" /> {timer}s
        </div>
      </div>
      <Progress value={progress} className="h-2" />

      {streak > 1 && <div className="text-center text-sm font-bold text-warning">🔥 {streak} streak!</div>}

      <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
        <span className="text-xs text-muted-foreground">{q.category}</span>
        <h2 className="text-lg font-semibold text-card-foreground">{q.question}</h2>
      </div>

      <div className="space-y-3">
        {q.options.map((opt, i) => {
          let variant: "outline" | "default" | "destructive" = "outline";
          let extra = "";
          if (selected !== null) {
            if (i === q.correctAnswer) extra = "border-success bg-success/10 text-success";
            else if (i === selected) extra = "border-destructive bg-destructive/10 text-destructive";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              className={`w-full rounded-xl border border-border bg-card p-4 text-left text-sm font-medium text-card-foreground transition-all hover:bg-muted disabled:opacity-80 ${extra}`}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Trivia;
