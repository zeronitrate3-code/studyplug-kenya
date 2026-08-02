-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','teacher','student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','teacher'))
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- GRADES
CREATE TABLE public.grades (
  id integer PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.grades TO authenticated, anon;
GRANT ALL ON public.grades TO service_role;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grades are readable" ON public.grades FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins manage grades" ON public.grades FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SUBJECTS
CREATE TABLE public.subjects (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subjects TO authenticated, anon;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are readable" ON public.subjects FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Staff manage subjects" ON public.subjects FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.grade_subjects (
  grade_id integer NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (grade_id, subject_id)
);
GRANT SELECT ON public.grade_subjects TO authenticated, anon;
GRANT ALL ON public.grade_subjects TO service_role;
ALTER TABLE public.grade_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grade subjects readable" ON public.grade_subjects FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Staff manage grade subjects" ON public.grade_subjects FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- TOPICS
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade_id integer REFERENCES public.grades(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.topics TO authenticated, anon;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Topics readable" ON public.topics FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Staff manage topics" ON public.topics FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- QUESTIONS
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  grade_id integer REFERENCES public.grades(id) ON DELETE SET NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  difficulty text NOT NULL DEFAULT 'medium',
  legacy_key text UNIQUE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX questions_subject_idx ON public.questions (subject_id);
CREATE INDEX questions_grade_idx ON public.questions (grade_id);
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can read questions" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage questions" ON public.questions FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EXAMS
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade_id integer REFERENCES public.grades(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  time_limit_seconds integer NOT NULL DEFAULT 600,
  question_count integer NOT NULL DEFAULT 5,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published exams readable" ON public.exams FOR SELECT TO authenticated
  USING (is_published OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage exams" ON public.exams FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER exams_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  UNIQUE (exam_id, question_id)
);
GRANT SELECT ON public.exam_questions TO authenticated;
GRANT ALL ON public.exam_questions TO service_role;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exam questions readable" ON public.exam_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage exam questions" ON public.exam_questions FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ATTEMPTS
CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exam_id uuid REFERENCES public.exams(id) ON DELETE SET NULL,
  subject_id text NOT NULL,
  grade_id integer,
  question_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exam_attempts_user_idx ON public.exam_attempts (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own attempts" ON public.exam_attempts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER exam_attempts_updated_at BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RESULTS
CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  attempt_id uuid REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES public.exams(id) ON DELETE SET NULL,
  subject_id text NOT NULL,
  subject_name text NOT NULL,
  grade_id integer,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  percentage integer NOT NULL,
  points integer NOT NULL DEFAULT 0,
  time_taken_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX results_user_idx ON public.results (user_id, created_at DESC);
CREATE INDEX results_subject_idx ON public.results (subject_id);
GRANT SELECT, INSERT ON public.results TO authenticated;
GRANT ALL ON public.results TO service_role;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own results" ON public.results FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own results" ON public.results FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()) OR private.can_view_full_profile(auth.uid(), user_id));

-- SUBJECT LEADERBOARD STATS
CREATE TABLE public.subject_leaderboard_stats (
  user_id uuid NOT NULL,
  subject_id text NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  exams_taken integer NOT NULL DEFAULT 0,
  sum_percentage integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subject_id)
);
GRANT SELECT ON public.subject_leaderboard_stats TO authenticated;
GRANT ALL ON public.subject_leaderboard_stats TO service_role;
ALTER TABLE public.subject_leaderboard_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subject leaderboard readable" ON public.subject_leaderboard_stats
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.apply_result_stats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.leaderboard_stats (user_id, total_points, exams_taken, sum_percentage, updated_at)
  VALUES (NEW.user_id, NEW.points, 1, NEW.percentage, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.leaderboard_stats.total_points + EXCLUDED.total_points,
    exams_taken = public.leaderboard_stats.exams_taken + 1,
    sum_percentage = public.leaderboard_stats.sum_percentage + EXCLUDED.sum_percentage,
    updated_at = now();

  INSERT INTO public.subject_leaderboard_stats (user_id, subject_id, total_points, exams_taken, sum_percentage, updated_at)
  VALUES (NEW.user_id, NEW.subject_id, NEW.points, 1, NEW.percentage, now())
  ON CONFLICT (user_id, subject_id) DO UPDATE SET
    total_points = public.subject_leaderboard_stats.total_points + EXCLUDED.total_points,
    exams_taken = public.subject_leaderboard_stats.exams_taken + 1,
    sum_percentage = public.subject_leaderboard_stats.sum_percentage + EXCLUDED.sum_percentage,
    updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.apply_result_stats() FROM anon, authenticated;
CREATE TRIGGER results_apply_stats AFTER INSERT ON public.results
  FOR EACH ROW EXECUTE FUNCTION public.apply_result_stats();

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏅',
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements readable" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage achievements" ON public.achievements FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id text NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own or visible achievements" ON public.user_achievements FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.can_view_full_profile(auth.uid(), user_id));
CREATE POLICY "Users insert own achievements" ON public.user_achievements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'general',
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Default student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Revision documents storage policies (bucket created separately)
CREATE POLICY "Signed-in users can read revision docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'revision-docs');
CREATE POLICY "Staff manage revision docs" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'revision-docs' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'revision-docs' AND public.is_staff(auth.uid()));