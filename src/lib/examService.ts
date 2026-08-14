import { supabase } from "@/integrations/supabase/client";
import type { Question } from "./mockData";
import { getQuestionsForSubject } from "./questionBank";

/** Subjects that share a question bank with another subject id. */
const ALIASES: Record<string, string> = {
  "pe-advanced": "pe",
  "health-fitness": "sports-science",
  anatomy: "biology",
  "sports-mgmt": "business",
  "theatre-film": "creative-arts",
  dance: "pe",
  "creative-writing": "literature",
};

export const EXAM_SIZE = 5;

export interface ExamQuestion extends Question {
  dbId: string | null;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Loads a fresh batch of questions for a subject from the database.
 * Questions the student already saw in previous attempts are skipped until the
 * whole bank has been used, so every exam is new. Falls back to the bundled
 * offline bank when the device has no connection.
 */
export const loadExamQuestions = async (
  subjectId: string,
  userId: string | null,
  count = EXAM_SIZE
): Promise<ExamQuestion[]> => {
  const offlineFallback = (): ExamQuestion[] =>
    getQuestionsForSubject(subjectId).map((q) => ({ ...q, dbId: null }));

  if (!navigator.onLine) return offlineFallback();

  const ids = [subjectId, ALIASES[subjectId]].filter(Boolean) as string[];

  // NOTE: answer keys are never sent to the browser. Marking happens server-side.
  const { data, error } = await supabase
    .from("questions")
    .select("id,question,options")
    .in("subject_id", ids)
    .limit(1000);

  if (error || !data || data.length === 0) return offlineFallback();

  let seen = new Set<string>();
  if (userId) {
    const { data: attempts } = await supabase
      .from("exam_attempts")
      .select("question_ids")
      .eq("user_id", userId)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false })
      .limit(200);
    attempts?.forEach((a) => {
      (Array.isArray(a.question_ids) ? a.question_ids : []).forEach((id) =>
        seen.add(String(id))
      );
    });
  }

  let pool = data.filter((q) => !seen.has(q.id));
  // Everything has been seen — start a new cycle over the full bank.
  if (pool.length < Math.min(count, data.length)) pool = data;

  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((q) => ({
      dbId: q.id,
      id: q.id,
      question: q.question,
      options: (q.options as string[]) ?? [],
      correctAnswer: -1, // revealed only after submission
      explanation: "",
    }));
};


export interface SubmitExamInput {
  userId: string;
  subjectId: string;
  subjectName: string;
  grade: number;
  questions: ExamQuestion[];
  answers: (number | null)[];
  timeTakenSeconds: number;
}

export interface ReviewRow {
  question_id: string;
  correct_answer: number | null;
  explanation: string;
}

export interface SubmitExamResult {
  score: number;
  total: number;
  percentage: number;
  points: number;
  review: ReviewRow[];
}

/**
 * Sends the attempt to the server, which marks it and only then returns the
 * correct answers/explanations for the review screen.
 */
export const submitExam = async (
  input: SubmitExamInput
): Promise<{ error: unknown; result: SubmitExamResult | null }> => {
  const questionIds = input.questions.map((q) => q.dbId).filter(Boolean) as string[];

  const { data, error } = await supabase.rpc("submit_exam_attempt", {
    p_subject_id: input.subjectId,
    p_subject_name: input.subjectName,
    p_grade_id: input.grade,
    p_question_ids: questionIds,
    p_answers: input.answers as unknown as never,
    p_time_taken_seconds: input.timeTakenSeconds,
  });

  if (error) return { error, result: null };

  const payload = data as unknown as SubmitExamResult;
  await awardAchievements(input.userId, payload?.percentage ?? 0);
  return { error: null, result: payload };
};


/** Checks badge criteria against the student's live stats and awards new ones. */
export const awardAchievements = async (userId: string, lastPercentage?: number) => {
  const [{ data: defs }, { data: earned }, { data: stats }] = await Promise.all([
    supabase.from("achievements").select("*"),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
    supabase
      .from("leaderboard_stats")
      .select("total_points,exams_taken")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!defs) return [];
  const have = new Set((earned ?? []).map((e) => e.achievement_id));
  const totalPoints = stats?.total_points ?? 0;
  const examsTaken = stats?.exams_taken ?? 0;

  const newly = defs.filter((a) => {
    if (have.has(a.id)) return false;
    switch (a.criteria_type) {
      case "exams_taken":
        return examsTaken >= a.criteria_value;
      case "total_points":
        return totalPoints >= a.criteria_value;
      case "perfect_score":
        return (lastPercentage ?? 0) === 100;
      case "score_percentage":
        return (lastPercentage ?? 0) >= a.criteria_value;
      default:
        return false;
    }
  });

  if (newly.length === 0) return [];

  await supabase
    .from("user_achievements")
    .insert(newly.map((a) => ({ user_id: userId, achievement_id: a.id })));

  await supabase.from("notifications").insert(
    newly.map((a) => ({
      user_id: userId,
      title: `${a.icon} Badge unlocked: ${a.name}`,
      body: a.description,
      type: "achievement",
      link: "/profile",
    }))
  );

  return newly;
};

export interface HistoryRow {
  id: string;
  subject_id: string;
  subject_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  points: number;
  created_at: string;
}

/** Exam history — merges the new results table with older exam records. */
export const fetchExamHistory = async (userId: string): Promise<HistoryRow[]> => {
  const [{ data: newer }, { data: legacy }] = await Promise.all([
    supabase
      .from("results")
      .select("id,subject_id,subject_name,score,total_questions,percentage,points,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("exam_results")
      .select("id,subject_id,subject_name,score,total_questions,percentage,points,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return [...(newer ?? []), ...(legacy ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};
