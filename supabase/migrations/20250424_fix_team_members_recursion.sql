
-- Function to check if a team member with a specific email exists for a project
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

-- Function to add a team member without triggering RLS recursion
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

-- Function to remove a team member without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.remove_team_member(p_member_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.project_team_members
  WHERE id = p_member_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.remove_team_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_team_member(UUID) TO service_role;

-- Update the team members query function to avoid recursion
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
  RETURN QUERY
  SELECT 
    ptm.id,
    ptm.project_id,
    ptm.user_id,
    ptm.role,
    ptm.email,
    ptm.name,
    ptm.added_by,
    ptm.added_at
  FROM public.project_team_members ptm
  WHERE ptm.project_id = p_project_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_project_team_members(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_team_members(UUID) TO service_role;
