CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','teacher'))
$$;

DROP POLICY "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(),'admin'));

DROP POLICY "Admins manage grades" ON public.grades;
CREATE POLICY "Admins manage grades" ON public.grades FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY "Staff manage subjects" ON public.subjects;
CREATE POLICY "Staff manage subjects" ON public.subjects FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "Staff manage grade subjects" ON public.grade_subjects;
CREATE POLICY "Staff manage grade subjects" ON public.grade_subjects FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "Staff manage topics" ON public.topics;
CREATE POLICY "Staff manage topics" ON public.topics FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "Staff manage questions" ON public.questions;
CREATE POLICY "Staff manage questions" ON public.questions FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "Published exams readable" ON public.exams;
CREATE POLICY "Published exams readable" ON public.exams FOR SELECT TO authenticated
  USING (is_published OR private.is_staff(auth.uid()));
DROP POLICY "Staff manage exams" ON public.exams;
CREATE POLICY "Staff manage exams" ON public.exams FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "Staff manage exam questions" ON public.exam_questions;
CREATE POLICY "Staff manage exam questions" ON public.exam_questions FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "Users read own results" ON public.results;
CREATE POLICY "Users read own results" ON public.results FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.is_staff(auth.uid()) OR private.can_view_full_profile(auth.uid(), user_id));

DROP POLICY "Staff manage achievements" ON public.achievements;
CREATE POLICY "Staff manage achievements" ON public.achievements FOR ALL TO authenticated
  USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY "Staff manage revision docs" ON storage.objects;
CREATE POLICY "Staff manage revision docs" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'revision-docs' AND private.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'revision-docs' AND private.is_staff(auth.uid()));

DROP FUNCTION public.has_role(uuid, public.app_role);
DROP FUNCTION public.is_staff(uuid);

CREATE OR REPLACE FUNCTION public.my_roles()
RETURNS SETOF public.app_role LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.my_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_roles() TO authenticated, service_role;