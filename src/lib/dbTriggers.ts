
// This file contains the SQL queries necessary to create database triggers
// For SOW notification triggers, run the following SQL in Supabase:

/*
-- Function to handle SOW status changes and create notifications
CREATE OR REPLACE FUNCTION public.handle_sow_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_project_name TEXT;
  v_project_owner_id UUID;
  v_coach_id UUID;
  v_owner_name TEXT;
  v_coach_name TEXT;
BEGIN
  -- Only proceed if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get project details
  SELECT p.id, p.title, p.user_id INTO v_project_id, v_project_name, v_project_owner_id
  FROM public.projects p
  WHERE p.id = NEW.project_id;
  
  -- Get coach ID (assuming the coach is in project_team_members with role='coach')
  SELECT ptm.user_id INTO v_coach_id
  FROM public.project_team_members ptm
  WHERE ptm.project_id = v_project_id AND ptm.role = 'coach'
  LIMIT 1;
  
  -- Get owner name
  SELECT name INTO v_owner_name FROM public.profiles WHERE id = v_project_owner_id;
  
  -- Get coach name
  SELECT name INTO v_coach_name FROM public.profiles WHERE id = v_coach_id;
  
  -- Create notifications based on status change
  IF NEW.status = 'ready for review' THEN
    -- Notify owner that SOW is ready for review
    PERFORM public.create_notification(
      v_project_owner_id,
      'sow_review',
      v_coach_name || ' has submitted an SOW for you to review',
      'To continue the project you will need to review the SOW.',
      'high',
      jsonb_build_object(
        'users', jsonb_build_array(
          jsonb_build_object(
            'id', v_coach_id,
            'name', v_coach_name,
            'avatar', substring(v_coach_name, 1, 1)
          )
        ),
        'project', jsonb_build_object(
          'id', v_project_id,
          'name', v_project_name
        ),
        'sow', jsonb_build_object(
          'id', NEW.id
        ),
        'availableActions', jsonb_build_array('view_sow', 'mark_as_read')
      )
    );
  ELSIF NEW.status = 'approved' THEN
    -- Notify coach that SOW was approved
    PERFORM public.create_notification(
      v_coach_id,
      'sow_approved',
      v_owner_name || ' has approved the ' || v_project_name || ' SOW',
      'Next, publish the project for bidding.',
      'high',
      jsonb_build_object(
        'users', jsonb_build_array(
          jsonb_build_object(
            'id', v_project_owner_id,
            'name', v_owner_name,
            'avatar', substring(v_owner_name, 1, 1)
          )
        ),
        'project', jsonb_build_object(
          'id', v_project_id,
          'name', v_project_name
        ),
        'availableActions', jsonb_build_array('publish_project', 'mark_as_read')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on statement_of_work table
DROP TRIGGER IF EXISTS sow_status_change_trigger ON public.statement_of_work;
CREATE TRIGGER sow_status_change_trigger
  AFTER UPDATE ON public.statement_of_work
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sow_status_change();
*/
