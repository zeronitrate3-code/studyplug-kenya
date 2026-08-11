import { supabase } from "@/integrations/supabase/client";

export interface TopicRow {
  id: string;
  subject_id: string;
  grade_id: number | null;
  name: string;
  description: string | null;
  order_number: number;
}

export interface NoteRow {
  id: string;
  topic_id: string;
  title: string;
  introduction: string | null;
  content: string | null;
  key_points: string | null;
  examples: string | null;
  formulas: string | null;
  common_mistakes: string | null;
  summary: string | null;
  order_number: number;
}

export interface PracticeQuestionRow {
  id: string;
  note_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;
  explanation: string | null;
  order_number: number;
}

export interface NoteWithTopic extends NoteRow {
  topic: TopicRow | null;
}

const NOTE_FIELDS =
  "id,topic_id,title,introduction,content,key_points,examples,formulas,common_mistakes,summary,order_number";
const TOPIC_FIELDS = "id,subject_id,grade_id,name,description,order_number";

export async function fetchTopics(grade: number, subjectIds: string[]) {
  let q = supabase.from("topics").select(TOPIC_FIELDS).eq("grade_id", grade);
  if (subjectIds.length) q = q.in("subject_id", subjectIds);
  const { data, error } = await q.order("order_number").order("name");
  if (error) throw error;
  return (data ?? []) as TopicRow[];
}

export async function fetchNotesForGrade(grade: number, subjectIds: string[]) {
  const topics = await fetchTopics(grade, subjectIds);
  if (!topics.length) return { topics, notes: [] as NoteWithTopic[] };
  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_FIELDS)
    .in(
      "topic_id",
      topics.map((t) => t.id)
    )
    .order("order_number");
  if (error) throw error;
  const byId = new Map(topics.map((t) => [t.id, t]));
  const notes = ((data ?? []) as NoteRow[]).map((n) => ({ ...n, topic: byId.get(n.topic_id) ?? null }));
  return { topics, notes };
}

export async function fetchNote(noteId: string): Promise<NoteWithTopic | null> {
  const { data, error } = await supabase.from("notes").select(NOTE_FIELDS).eq("id", noteId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: topic } = await supabase
    .from("topics")
    .select(TOPIC_FIELDS)
    .eq("id", (data as NoteRow).topic_id)
    .maybeSingle();
  return { ...(data as NoteRow), topic: (topic as TopicRow) ?? null };
}

export async function fetchPracticeQuestions(noteId: string) {
  const { data, error } = await supabase
    .from("practice_questions")
    .select("id,note_id,question,option_a,option_b,option_c,option_d,correct_answer,explanation,order_number")
    .eq("note_id", noteId)
    .order("order_number");
  if (error) throw error;
  return (data ?? []) as PracticeQuestionRow[];
}

export interface ProgressRow {
  note_id: string;
  completed: boolean;
  progress_percentage: number;
  last_viewed_at: string;
}

export async function fetchProgress(userId: string) {
  const { data } = await supabase
    .from("student_note_progress")
    .select("note_id,completed,progress_percentage,last_viewed_at")
    .eq("user_id", userId)
    .order("last_viewed_at", { ascending: false });
  return (data ?? []) as ProgressRow[];
}

export async function saveProgress(
  userId: string,
  noteId: string,
  patch: { completed?: boolean; progress_percentage?: number }
) {
  const { error } = await supabase.from("student_note_progress").upsert(
    {
      user_id: userId,
      note_id: noteId,
      completed: patch.completed ?? false,
      progress_percentage: patch.progress_percentage ?? 0,
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,note_id" }
  );
  return error;
}

export async function fetchBookmarks(userId: string) {
  const { data } = await supabase.from("bookmarked_notes").select("note_id").eq("user_id", userId);
  return (data ?? []).map((b) => b.note_id as string);
}

export async function toggleBookmark(userId: string, noteId: string, on: boolean) {
  if (on) {
    const { error } = await supabase.from("bookmarked_notes").insert({ user_id: userId, note_id: noteId });
    return error;
  }
  const { error } = await supabase
    .from("bookmarked_notes")
    .delete()
    .eq("user_id", userId)
    .eq("note_id", noteId);
  return error;
}
