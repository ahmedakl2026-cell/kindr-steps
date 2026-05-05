CREATE TABLE public.activity_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

ALTER TABLE public.activity_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activity likes"
ON public.activity_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can like activities"
ON public.activity_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike activities"
ON public.activity_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_activity_likes_activity ON public.activity_likes(activity_id);
CREATE INDEX idx_activity_likes_user ON public.activity_likes(user_id);