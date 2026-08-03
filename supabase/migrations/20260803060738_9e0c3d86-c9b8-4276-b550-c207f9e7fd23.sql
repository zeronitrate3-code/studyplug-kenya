ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pathway text,
  ADD COLUMN IF NOT EXISTS selected_subjects text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.note_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic_key text NOT NULL,
  grade integer,
  subject_id text,
  bookmarked boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  last_read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.note_progress TO authenticated;
GRANT ALL ON public.note_progress TO service_role;

ALTER TABLE public.note_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own note progress"
ON public.note_progress FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_note_progress_updated_at
BEFORE UPDATE ON public.note_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();