
-- Function to automatically add project creator as owner to project team
CREATE OR REPLACE FUNCTION public.handle_project_creator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.project_team_members (project_id, user_id, role, added_by)
  VALUES (NEW.id, NEW.user_id, 'owner', NEW.user_id);
  RETURN NEW;
END;
$$;

-- Trigger to run after a new project is created
CREATE TRIGGER on_project_created
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.handle_project_creator();

-- Function to automatically add coaches as team members for all projects
CREATE OR REPLACE FUNCTION public.add_coaches_to_projects()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    coach_record RECORD;
BEGIN
    -- Find all coaches in the profiles table
    FOR coach_record IN 
        SELECT id FROM public.profiles WHERE role = 'coach'
    LOOP
        -- Add each coach to the project team if they don't already exist
        INSERT INTO public.project_team_members (project_id, user_id, role, added_by)
        VALUES (NEW.id, coach_record.id, 'coach', NEW.user_id)
        ON CONFLICT (project_id, user_id) DO NOTHING; -- Avoid duplicates
    END LOOP;
    RETURN NEW;
END;
$$;

-- Trigger to run after a new project is created to add coaches
CREATE TRIGGER on_project_created_add_coaches
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.add_coaches_to_projects();
