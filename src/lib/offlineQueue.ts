import { supabase } from "@/integrations/supabase/client";

export interface QueuedExamResult {
  user_id: string;
  subject_id: string;
  subject_name: string;
  grade: number;
  score: number;
  total_questions: number;
  percentage: number;
  points: number;
  created_at: string;
}

const KEY = "studyplug_pending_exam_results";

export const getQueue = (): QueuedExamResult[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedExamResult[]) : [];
  } catch {
    return [];
  }
};

const setQueue = (items: QueuedExamResult[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const queueExamResult = (result: QueuedExamResult) => {
  setQueue([...getQueue(), result]);
};

/**
 * Attempts to upload all queued exam results. Returns the number synced.
 * Items that fail stay in the queue for the next attempt.
 */
export const syncQueuedResults = async (userId: string): Promise<number> => {
  const queue = getQueue();
  if (queue.length === 0) return 0;

  const mine = queue.filter((q) => q.user_id === userId);
  const others = queue.filter((q) => q.user_id !== userId);
  if (mine.length === 0) return 0;

  const { error } = await supabase.from("results").insert(
    mine.map((q) => ({
      user_id: q.user_id,
      subject_id: q.subject_id,
      subject_name: q.subject_name,
      grade_id: q.grade,
      score: q.score,
      total_questions: q.total_questions,
      percentage: q.percentage,
      points: q.points,
      created_at: q.created_at,
    }))
  );
  if (error) return 0;

  setQueue(others);
  return mine.length;
};
