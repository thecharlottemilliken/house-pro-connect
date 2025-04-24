
-- Fix RLS policies for coaches to access projects directly

-- Create a more robust function to check if a user is a coach
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

-- Update the policy for coaches to view projects
DROP POLICY IF EXISTS "Coaches can view all projects" ON public.projects;

CREATE POLICY "Coaches can view all projects" 
  ON public.projects 
  FOR SELECT 
  USING (public.is_user_coach());

-- Allow coaches to also update projects
CREATE POLICY "Coaches can update projects" 
  ON public.projects 
  FOR UPDATE
  USING (public.is_user_coach());

-- Allow coaches to view all properties
DROP POLICY IF EXISTS "Coaches can view all properties" ON public.properties;

CREATE POLICY "Coaches can view all properties" 
  ON public.properties 
  FOR SELECT 
  USING (public.is_user_coach());

-- Allow coaches to view all team members
DROP POLICY IF EXISTS "Coaches can view all team members" ON public.project_team_members;

CREATE POLICY "Coaches can view all team members" 
  ON public.project_team_members 
  FOR SELECT 
  USING (public.is_user_coach());

-- Allow coaches to manage team members (add/update)
CREATE POLICY "Coaches can manage team members" 
  ON public.project_team_members 
  FOR ALL
  USING (public.is_user_coach());
