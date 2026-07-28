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

  const { error } = await supabase.from("exam_results").insert(mine);
  if (error) return 0;

  setQueue(others);
  return mine.length;
};
