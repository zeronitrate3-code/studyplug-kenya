ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS order_number integer NOT NULL DEFAULT 0;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS description text;

CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  introduction text,
  content text,
  key_points text,
  examples text,
  formulas text,
  common_mistakes text,
  summary text,
  order_number integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_read_authenticated" ON public.notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "notes_staff_insert" ON public.notes FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "notes_staff_update" ON public.notes FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "notes_staff_delete" ON public.notes FOR DELETE TO authenticated USING (private.is_staff(auth.uid()));
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS notes_topic_idx ON public.notes(topic_id, order_number);

CREATE TABLE IF NOT EXISTS public.practice_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text,
  option_d text,
  correct_answer text NOT NULL,
  explanation text,
  order_number integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_questions TO authenticated;
GRANT ALL ON public.practice_questions TO service_role;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pq_read_authenticated" ON public.practice_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "pq_staff_insert" ON public.practice_questions FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "pq_staff_update" ON public.practice_questions FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "pq_staff_delete" ON public.practice_questions FOR DELETE TO authenticated USING (private.is_staff(auth.uid()));
CREATE INDEX IF NOT EXISTS pq_note_idx ON public.practice_questions(note_id, order_number);

CREATE TABLE IF NOT EXISTS public.student_note_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  progress_percentage integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, note_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_note_progress TO authenticated;
GRANT ALL ON public.student_note_progress TO service_role;
ALTER TABLE public.student_note_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snp_own_all" ON public.student_note_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER student_note_progress_updated_at BEFORE UPDATE ON public.student_note_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.bookmarked_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, note_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarked_notes TO authenticated;
GRANT ALL ON public.bookmarked_notes TO service_role;
ALTER TABLE public.bookmarked_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bn_own_all" ON public.bookmarked_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);