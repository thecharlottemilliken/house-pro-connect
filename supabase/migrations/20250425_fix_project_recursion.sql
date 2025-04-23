
-- Fix infinite recursion in projects table RLS by creating a security definer function
CREATE OR REPLACE FUNCTION public.check_coach_access()
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.check_coach_access() TO authenticated;

-- Drop existing policies if they cause recursion
DROP POLICY IF EXISTS "Coaches can view all projects" ON public.projects;

-- Create policy that allows coaches to view all projects using the security definer function
CREATE POLICY "Coaches can view all projects" 
  ON public.projects 
  FOR SELECT 
  USING (public.check_coach_access());

-- Enable RLS on projects table if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
