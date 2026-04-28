
-- Add autism to condition_type enum
ALTER TYPE condition_type ADD VALUE IF NOT EXISTS 'autism';

-- Add avatar_url to specialists for profile pictures
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add credentials/certifications field
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS credentials text;
