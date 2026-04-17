-- Create exam_results table
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all exam results"
  ON public.exam_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own exam results"
  ON public.exam_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_exam_results_user ON public.exam_results(user_id);
CREATE INDEX idx_exam_results_grade ON public.exam_results(grade);

-- Leaderboard view: aggregated total points per user with profile info
CREATE VIEW public.leaderboard
WITH (security_invoker=on) AS
SELECT
  p.user_id,
  p.display_name,
  p.avatar_url,
  p.grade,
  COALESCE(SUM(er.points), 0)::int AS total_points,
  COUNT(er.id)::int AS exams_taken,
  COALESCE(ROUND(AVG(er.percentage)), 0)::int AS avg_percentage
FROM public.profiles p
LEFT JOIN public.exam_results er ON er.user_id = p.user_id
GROUP BY p.user_id, p.display_name, p.avatar_url, p.grade;