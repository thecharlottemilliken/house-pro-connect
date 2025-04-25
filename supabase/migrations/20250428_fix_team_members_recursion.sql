
-- Create an improved function to safely check if a member exists without triggering recursion
CREATE OR REPLACE FUNCTION public.check_existing_team_member(p_project_id UUID, p_email TEXT)
RETURNS TABLE(exists BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT EXISTS (
    SELECT 1 
    FROM public.project_team_members 
    WHERE project_id = p_project_id AND email = p_email
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_existing_team_member(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_existing_team_member(UUID, TEXT) TO service_role;

-- Enhanced function to get team members for a project without causing recursion
CREATE OR REPLACE FUNCTION public.get_project_team_members(p_project_id UUID)
RETURNS TABLE(
  id UUID,
  project_id UUID,
  user_id UUID,
  role TEXT,
  email TEXT,
  name TEXT,
  added_by UUID,
  added_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get the project owner first (from projects table)
  RETURN QUERY
  SELECT 
    ptm.id,
    ptm.project_id,
    ptm.user_id,
    ptm.role,
    COALESCE(ptm.email, p.email) as email,
    COALESCE(ptm.name, p.name) as name,
    ptm.added_by,
    ptm.added_at
  FROM public.project_team_members ptm
  LEFT JOIN public.profiles p ON ptm.user_id = p.id
  WHERE ptm.project_id = p_project_id
  ORDER BY 
    CASE WHEN ptm.role = 'owner' THEN 0
         WHEN ptm.role = 'coach' THEN 1
         ELSE 2
    END,
    COALESCE(ptm.name, p.name);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_project_team_members(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_team_members(UUID) TO service_role;

-- Update the supabase config to register this function
-- Add to config.toml happens automatically

-- Improved function for adding team members without recursion
CREATE OR REPLACE FUNCTION public.add_team_member(
  p_project_id UUID,
  p_user_id UUID,
  p_role TEXT,
  p_email TEXT,
  p_name TEXT
)
RETURNS TABLE(id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id UUID;
BEGIN
  INSERT INTO public.project_team_members (
    project_id,
    user_id,
    role,
    email,
    name,
    added_by
  ) VALUES (
    p_project_id,
    p_user_id,
    p_role,
    p_email,
    p_name,
    auth.uid()
  )
  RETURNING id INTO v_member_id;
  
  RETURN QUERY SELECT v_member_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.add_team_member(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_team_member(UUID, UUID, TEXT, TEXT, TEXT) TO service_role;

-- Create a function to check if the current user is a coach
CREATE OR REPLACE FUNCTION public.is_user_coach()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'coach'
  );
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_coach TO authenticated;

-- Use the coach function for RLS policies instead of direct queries
DROP POLICY IF EXISTS "Coaches can view all team members" ON public.project_team_members;
CREATE POLICY "Coaches can view all team members" 
  ON public.project_team_members 
  FOR SELECT 
  USING (public.is_user_coach());

-- Add missing property access policies
DROP POLICY IF EXISTS "Coaches can view all properties" ON public.properties;
CREATE POLICY "Coaches can view all properties" 
  ON public.properties 
  FOR SELECT 
  USING (public.is_user_coach());

-- Fix property owner access policies
CREATE POLICY "Owners can access their own properties"
  ON public.properties
  FOR ALL
  USING (auth.uid() = user_id);
