-- 1. Private schema for helper functions (not exposed via API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.can_view_full_profile(_viewer uuid, _target uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _viewer = _target
    OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _target AND is_private = true)
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
        AND (
          (requester_id = _viewer AND addressee_id = _target)
          OR (requester_id = _target AND addressee_id = _viewer)
        )
    );
$$;
REVOKE ALL ON FUNCTION private.can_view_full_profile(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_view_full_profile(uuid, uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.can_view_room(_user uuid, _room uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_rooms r
    WHERE r.id = _room
      AND (r.is_custom = false OR r.created_by = _user)
  )
  OR EXISTS (
    SELECT 1 FROM public.chat_messages m
    WHERE m.room_id = _room AND m.user_id = _user
  );
$$;
REVOKE ALL ON FUNCTION private.can_view_room(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_view_room(uuid, uuid) TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.can_view_full_profile(uuid, uuid);

-- Trigger-only functions must not be directly callable by clients
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 2. exam_results: owner or permitted viewer only
DROP POLICY IF EXISTS "Authenticated users can view all exam results" ON public.exam_results;
CREATE POLICY "Users can view own or visible exam results"
  ON public.exam_results FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.can_view_full_profile(auth.uid(), user_id));

-- 3. profiles: respect is_private, authenticated only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable when public or permitted"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_private = false OR private.can_view_full_profile(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.profiles FROM anon;

-- 4. Leaderboard view: aggregates only, hides private profiles
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard
WITH (security_invoker = off) AS
  SELECT p.user_id,
     p.display_name,
     p.avatar_url,
     p.grade,
     (COALESCE(sum(er.points), (0)::bigint))::integer AS total_points,
     (count(er.id))::integer AS exams_taken,
     (COALESCE(round(avg(er.percentage)), (0)::numeric))::integer AS avg_percentage
    FROM (public.profiles p
      LEFT JOIN public.exam_results er ON ((er.user_id = p.user_id)))
   WHERE p.is_private = false OR private.can_view_full_profile(auth.uid(), p.user_id)
   GROUP BY p.user_id, p.display_name, p.avatar_url, p.grade;

GRANT SELECT ON public.leaderboard TO authenticated;

-- 5. chat_messages: only rooms the user can access
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.chat_messages;
CREATE POLICY "Users can view messages in accessible rooms"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.can_view_room(auth.uid(), room_id));

-- 6. Storage tightening
DROP POLICY IF EXISTS "Tutor uploads are publicly viewable" ON storage.objects;
CREATE POLICY "Users can view their own tutor uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'tutor-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own tutor uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tutor-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public buckets: remove broad listing policies (files stay reachable via public URLs)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Room images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;

-- Chat images must be owned by the uploader: avatars/chat/<uid>/...
DROP POLICY IF EXISTS "Users can upload chat images" ON storage.objects;
CREATE POLICY "Users can upload own chat images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'chat'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
CREATE POLICY "Users can delete own chat images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'chat'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Support uploads: avatars/support/<uid>/...
CREATE POLICY "Users can upload own support images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'support'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );