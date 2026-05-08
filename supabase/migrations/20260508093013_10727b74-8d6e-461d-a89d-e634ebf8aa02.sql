
-- Site settings (for dynamic homepage header logos & similar global config)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default keys
INSERT INTO public.site_settings (key, value) VALUES
  ('header_logo_right', ''),
  ('header_title', 'منصة خطوة'),
  ('header_logo_left', '')
ON CONFLICT (key) DO NOTHING;

-- Allow tagging activities to a specific disability for the Library "Activities" area
ALTER TABLE public.kids_activities
  ADD COLUMN IF NOT EXISTS disability TEXT;

CREATE INDEX IF NOT EXISTS idx_kids_activities_disability
  ON public.kids_activities (disability);
