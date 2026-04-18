-- Chat rooms: support user-created rooms with custom image
ALTER TABLE public.chat_rooms
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false;

-- Allow authenticated users to create custom rooms (only as themselves)
DROP POLICY IF EXISTS "Users can create custom rooms" ON public.chat_rooms;
CREATE POLICY "Users can create custom rooms"
  ON public.chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Allow creators to update/delete their own custom rooms
DROP POLICY IF EXISTS "Creators can update their rooms" ON public.chat_rooms;
CREATE POLICY "Creators can update their rooms"
  ON public.chat_rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can delete their rooms" ON public.chat_rooms;
CREATE POLICY "Creators can delete their rooms"
  ON public.chat_rooms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Profiles: privacy lock + last seen for online presence fallback
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Helper function: can the viewer see full profile data?
CREATE OR REPLACE FUNCTION public.can_view_full_profile(_viewer uuid, _target uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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

-- Storage bucket for custom room images
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for room-images
DROP POLICY IF EXISTS "Room images are publicly viewable" ON storage.objects;
CREATE POLICY "Room images are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'room-images');

DROP POLICY IF EXISTS "Authenticated users can upload room images" ON storage.objects;
CREATE POLICY "Authenticated users can upload room images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'room-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own room images" ON storage.objects;
CREATE POLICY "Users can delete their own room images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'room-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage bucket for AI tutor uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-uploads', 'tutor-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Tutor uploads are publicly viewable" ON storage.objects;
CREATE POLICY "Tutor uploads are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'tutor-uploads');

DROP POLICY IF EXISTS "Authenticated users can upload tutor images" ON storage.objects;
CREATE POLICY "Authenticated users can upload tutor images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tutor-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- AI tutor conversation history
CREATE TABLE IF NOT EXISTS public.ai_tutor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_tutor_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own tutor messages" ON public.ai_tutor_messages;
CREATE POLICY "Users view own tutor messages"
  ON public.ai_tutor_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own tutor messages" ON public.ai_tutor_messages;
CREATE POLICY "Users insert own tutor messages"
  ON public.ai_tutor_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own tutor messages" ON public.ai_tutor_messages;
CREATE POLICY "Users delete own tutor messages"
  ON public.ai_tutor_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_tutor_messages_user_created_idx
  ON public.ai_tutor_messages (user_id, created_at);
