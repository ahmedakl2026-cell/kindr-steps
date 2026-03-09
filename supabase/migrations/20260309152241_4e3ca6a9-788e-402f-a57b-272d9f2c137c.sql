
-- Function to let users set their own role (only if they don't have one yet)
CREATE OR REPLACE FUNCTION public.setup_user_role(_user_id UUID, _role app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already has a role';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
END;
$$;
