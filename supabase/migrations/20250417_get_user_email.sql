
-- This function allows getting a user's email by their ID
-- It's needed because we can't directly query auth.users from client code
CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TABLE (email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT users.email::text
  FROM auth.users
  WHERE users.id = user_id;
END;
$$;
