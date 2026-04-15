
-- Chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '💬',
  grade_level INTEGER,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat rooms" ON public.chat_rooms
  FOR SELECT TO authenticated USING (true);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  text TEXT,
  image_url TEXT,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Seed default chat rooms
INSERT INTO public.chat_rooms (name, description, icon, grade_level) VALUES
  ('General Discussion', 'Talk about anything school-related', '🎓', NULL),
  ('Mathematics Help', 'Get help with math problems', '📐', NULL),
  ('Science Lab', 'Discuss physics, chemistry & biology', '🔬', NULL),
  ('English & Literature', 'Language arts discussions', '📚', NULL),
  ('Kiswahili Corner', 'Mazungumzo ya Kiswahili', '🇰🇪', NULL),
  ('Grade 7 Hub', 'For Grade 7 students', '7️⃣', 7),
  ('Grade 8 Hub', 'For Grade 8 students', '8️⃣', 8),
  ('Exam Prep', 'Share tips and strategies for exams', '📝', NULL);

-- Storage policy for chat images
CREATE POLICY "Users can upload chat images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'chat');

CREATE POLICY "Anyone can view chat images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'chat');
