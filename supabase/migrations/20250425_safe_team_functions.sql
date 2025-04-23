
-- Create a safer function to add team members without triggering recursion
CREATE OR REPLACE FUNCTION public.add_team_member_safely(
  p_project_id UUID,
  p_user_id UUID,
  p_role TEXT,
  p_added_by UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert directly using security definer privileges to bypass RLS
  INSERT INTO public.project_team_members (project_id, user_id, role, added_by)
  VALUES (p_project_id, p_user_id, p_role, p_added_by)
  ON CONFLICT (project_id, user_id) DO NOTHING;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_team_member_safely TO authenticated;
