
-- Fix the trigger function to add coaches to new projects
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
        ON CONFLICT (project_id, user_id) DO NOTHING; -- Avoid duplicates if a constraint exists
    END LOOP;
    RETURN NEW;
END;
$$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_project_created_add_coaches ON public.projects;

-- Create the trigger to add coaches to new projects
CREATE TRIGGER on_project_created_add_coaches
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.add_coaches_to_projects();

-- Create a function to add coaches to all existing projects
CREATE OR REPLACE FUNCTION public.add_coaches_to_all_projects()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    project_record RECORD;
    coach_record RECORD;
BEGIN
    -- Loop through each project
    FOR project_record IN 
        SELECT id, user_id FROM public.projects
    LOOP
        -- Find all coaches in the profiles table
        FOR coach_record IN 
            SELECT id FROM public.profiles WHERE role = 'coach'
        LOOP
            -- Add each coach to each project team
            INSERT INTO public.project_team_members (project_id, user_id, role, added_by)
            VALUES (project_record.id, coach_record.id, 'coach', project_record.user_id)
            ON CONFLICT DO NOTHING; -- Avoid duplicates
        END LOOP;
    END LOOP;
END;
$$;

-- Create a constraint to ensure uniqueness of project_id and user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'project_team_members_project_id_user_id_key'
    ) THEN
        ALTER TABLE public.project_team_members 
        ADD CONSTRAINT project_team_members_project_id_user_id_key 
        UNIQUE (project_id, user_id);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.add_coaches_to_all_projects() TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_coaches_to_all_projects() TO service_role;
