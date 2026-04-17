-- Friendships table: stores friend requests and accepted friendships
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- View any friendship row that involves you
CREATE POLICY "Users can view their own friendships"
ON public.friendships FOR SELECT
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Send a friend request (you must be the requester)
CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

-- Update only friendships you're part of (e.g. accept a request)
CREATE POLICY "Users can update their own friendships"
ON public.friendships FOR UPDATE
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Remove a friendship you're part of
CREATE POLICY "Users can delete their own friendships"
ON public.friendships FOR DELETE
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();