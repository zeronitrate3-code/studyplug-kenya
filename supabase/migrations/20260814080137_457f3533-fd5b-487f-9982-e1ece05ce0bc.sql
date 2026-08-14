-- 1. Hide answer keys from direct table reads -------------------------------
REVOKE SELECT ON public.questions FROM authenticated, anon;
GRANT SELECT (id, subject_id, topic_id, grade_id, question, options, difficulty, legacy_key, created_by, created_at, updated_at)
  ON public.questions TO authenticated;

REVOKE SELECT ON public.practice_questions FROM authenticated, anon;
GRANT SELECT (id, note_id, question, option_a, option_b, option_c, option_d, order_number, created_at)
  ON public.practice_questions TO authenticated;

-- helper: staff check
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','teacher')
  )
$$;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- 2. Exam-to-question mapping only for staff or owners of an attempt --------
DROP POLICY IF EXISTS "Exam questions readable" ON public.exam_questions;
CREATE POLICY "Exam questions readable by staff or attempt owner"
ON public.exam_questions FOR SELECT TO authenticated
USING (
  public.is_staff(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.exam_attempts a
    WHERE a.exam_id = exam_questions.exam_id AND a.user_id = auth.uid()
  )
);

-- 3. Server-side exam marking ----------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(
  p_subject_id text,
  p_subject_name text,
  p_grade_id integer,
  p_question_ids uuid[],
  p_answers jsonb,
  p_time_taken_seconds integer DEFAULT NULL,
  p_exam_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_total int := COALESCE(array_length(p_question_ids, 1), 0);
  v_score int := 0;
  v_pct int := 0;
  v_points int := 0;
  v_attempt uuid;
  v_review jsonb := '[]'::jsonb;
  i int;
  v_given int;
  v_correct int;
  v_expl text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF v_total = 0 OR v_total > 200 THEN
    RAISE EXCEPTION 'Invalid question set';
  END IF;

  FOR i IN 1..v_total LOOP
    SELECT q.correct_answer, q.explanation INTO v_correct, v_expl
    FROM public.questions q WHERE q.id = p_question_ids[i];

    BEGIN
      v_given := NULLIF(p_answers -> (i - 1), 'null'::jsonb)::int;
    EXCEPTION WHEN others THEN
      v_given := NULL;
    END;

    IF v_correct IS NOT NULL AND v_given IS NOT NULL AND v_given = v_correct THEN
      v_score := v_score + 1;
    END IF;

    v_review := v_review || jsonb_build_object(
      'question_id', p_question_ids[i],
      'correct_answer', v_correct,
      'explanation', COALESCE(v_expl, '')
    );
  END LOOP;

  v_pct := ROUND((v_score::numeric / v_total) * 100);
  v_points := v_score * 10;

  INSERT INTO public.exam_attempts (user_id, exam_id, subject_id, grade_id, question_ids, answers, status, submitted_at)
  VALUES (v_uid, p_exam_id, p_subject_id, p_grade_id, to_jsonb(p_question_ids), p_answers, 'completed', now())
  RETURNING id INTO v_attempt;

  INSERT INTO public.results (user_id, attempt_id, exam_id, subject_id, subject_name, grade_id, score, total_questions, percentage, points, time_taken_seconds)
  VALUES (v_uid, v_attempt, p_exam_id, p_subject_id, p_subject_name, p_grade_id, v_score, v_total, v_pct, v_points, p_time_taken_seconds);

  RETURN jsonb_build_object(
    'attempt_id', v_attempt,
    'score', v_score,
    'total', v_total,
    'percentage', v_pct,
    'points', v_points,
    'review', v_review
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(text, text, integer, uuid[], jsonb, integer, uuid) TO authenticated;

-- 4. Practice question answer check ----------------------------------------
CREATE OR REPLACE FUNCTION public.check_practice_answer(p_question_id uuid, p_answer text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_correct text;
  v_expl text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT upper(btrim(correct_answer)), explanation INTO v_correct, v_expl
  FROM public.practice_questions WHERE id = p_question_id;
  IF v_correct IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;
  RETURN jsonb_build_object(
    'correct', upper(btrim(COALESCE(p_answer, ''))) = v_correct,
    'correct_answer', v_correct,
    'explanation', COALESCE(v_expl, '')
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_practice_answer(uuid, text) TO authenticated;

-- 5. Staff-only full reads for content management ---------------------------
CREATE OR REPLACE FUNCTION public.staff_list_questions(p_limit integer DEFAULT 200)
RETURNS SETOF public.questions
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM public.questions ORDER BY created_at DESC LIMIT LEAST(COALESCE(p_limit,200), 1000);
END;
$$;
GRANT EXECUTE ON FUNCTION public.staff_list_questions(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.staff_list_practice_questions(p_note_id uuid)
RETURNS SETOF public.practice_questions
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM public.practice_questions WHERE note_id = p_note_id ORDER BY order_number;
END;
$$;
GRANT EXECUTE ON FUNCTION public.staff_list_practice_questions(uuid) TO authenticated;