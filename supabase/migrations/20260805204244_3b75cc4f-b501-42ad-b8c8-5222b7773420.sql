CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own push subscriptions"
ON public.push_subscriptions FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- admin helper
CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') $$;

REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC, anon, authenticated;

-- grant admin to the owner account
INSERT INTO public.user_roles (user_id, role)
VALUES ('1c113922-d143-430d-bbb1-8f8b87b44aa6', 'admin')
ON CONFLICT DO NOTHING;

-- admins can view every profile, including locked ones
DROP POLICY IF EXISTS "Profiles viewable when public or permitted" ON public.profiles;
CREATE POLICY "Profiles viewable when public or permitted"
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR is_private = false
  OR private.can_view_full_profile(auth.uid(), user_id)
  OR private.is_admin(auth.uid())
);

-- admins may send notifications to any learner
CREATE POLICY "Admins can notify any user"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (private.is_admin(auth.uid()));
