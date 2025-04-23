
-- Create a function to safely get user properties without triggering RLS infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_properties(p_user_id UUID)
RETURNS SETOF public.properties
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.properties 
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
END;
$$;

-- Create RLS policy for the function
GRANT EXECUTE ON FUNCTION public.get_user_properties(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_properties(UUID) TO service_role;
