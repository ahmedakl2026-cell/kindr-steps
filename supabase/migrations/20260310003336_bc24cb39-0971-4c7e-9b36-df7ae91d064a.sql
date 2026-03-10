
-- Create invited_users table for pre-approved registrations
CREATE TABLE public.invited_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role public.app_role NOT NULL,
  invited_by uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(email, role)
);

ALTER TABLE public.invited_users ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invitations
CREATE POLICY "Admins can view invitations" ON public.invited_users
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert invitations" ON public.invited_users
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invitations" ON public.invited_users
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update setup_user_role to allow invited users to self-assign
CREATE OR REPLACE FUNCTION public.setup_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email text;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already has a role';
  END IF;

  -- Get user email
  SELECT email INTO _email FROM auth.users WHERE id = _user_id;

  -- Check if user is invited for this role
  IF EXISTS (SELECT 1 FROM public.invited_users WHERE email = _email AND role = _role) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
    -- Remove invitation after use
    DELETE FROM public.invited_users WHERE email = _email AND role = _role;
    RETURN;
  END IF;

  -- Allow parent self-registration and specialist self-registration
  IF _role IN ('parent', 'specialist') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
    RETURN;
  END IF;

  RAISE EXCEPTION 'Not authorized for this role';
END;
$$;

-- Seed the admin user invitation
INSERT INTO public.invited_users (email, role) VALUES ('ahmedakl83@gmail.com', 'admin');
