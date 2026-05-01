
-- Add structured fields to community_posts (keep existing content for backward compat)
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS problem TEXT,
  ADD COLUMN IF NOT EXISTS how_helped TEXT,
  ADD COLUMN IF NOT EXISTS result TEXT;

-- Kids activities gallery (admin-managed)
CREATE TABLE IF NOT EXISTS public.kids_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view activities"
ON public.kids_activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert activities"
ON public.kids_activities FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update activities"
ON public.kids_activities FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete activities"
ON public.kids_activities FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_kids_activities_updated_at
BEFORE UPDATE ON public.kids_activities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public storage bucket for activity images
INSERT INTO storage.buckets (id, name, public)
VALUES ('kids-activities', 'kids-activities', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Activity images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'kids-activities');

CREATE POLICY "Admins can upload activity images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kids-activities' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update activity images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'kids-activities' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete activity images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kids-activities' AND has_role(auth.uid(), 'admin'::app_role));
