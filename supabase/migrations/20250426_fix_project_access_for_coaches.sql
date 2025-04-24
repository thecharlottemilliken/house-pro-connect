
-- Create a function that can safely check if a user is a coach without triggering recursion
CREATE OR REPLACE FUNCTION public.check_user_is_coach(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id 
    AND role = 'coach'
  );
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_is_coach TO authenticated;

-- Create a function to get project details safely for coaches
CREATE OR REPLACE FUNCTION public.get_project_for_coach(p_project_id UUID)
RETURNS SETOF public.projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.projects 
  WHERE id = p_project_id;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_project_for_coach TO authenticated;

-- Create a function to get property details safely for coaches
CREATE OR REPLACE FUNCTION public.get_property_for_coach(p_property_id UUID)
RETURNS SETOF public.properties
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.properties
  WHERE id = p_property_id;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_property_for_coach TO authenticated;
