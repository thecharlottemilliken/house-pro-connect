
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
