REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_exam_attempt(text, text, integer, uuid[], jsonb, integer, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.check_practice_answer(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.staff_list_questions(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.staff_list_practice_questions(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(text, text, integer, uuid[], jsonb, integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_practice_answer(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_list_questions(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_list_practice_questions(uuid) TO authenticated;