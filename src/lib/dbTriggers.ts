
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
  v_previous_status TEXT;
BEGIN
  -- Only proceed if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Store previous status for checking if this is a revision
  v_previous_status := OLD.status;
  
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
    -- Check if this is a revision (previous status was 'pending revision')
    IF v_previous_status = 'pending revision' THEN
      -- Notify owner that revised SOW is ready for review
      PERFORM public.create_notification(
        v_project_owner_id,
        'sow_revised',
        v_coach_name || ' has submitted revised SOW for your review',
        'The Statement of Work has been updated with your requested changes.',
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
    ELSE
      -- Notify owner that SOW is ready for review (original notification)
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
    END IF;
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
  ELSIF NEW.status = 'pending revision' THEN
    -- Notify coach that revisions were requested
    PERFORM public.create_notification(
      v_coach_id,
      'sow_revision_requested',
      v_owner_name || ' has requested changes to the SOW',
      COALESCE(NEW.feedback, 'Please review the feedback and update the SOW.'),
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
        'sow', jsonb_build_object(
          'id', NEW.id,
          'feedback', NEW.feedback
        ),
        'availableActions', jsonb_build_array('view_sow', 'mark_as_read')
      )
    );
  END IF;
  
  -- Delete existing action items related to SOW status to avoid duplicates
  DELETE FROM public.project_action_items
  WHERE project_id = v_project_id
  AND (title IN (
    'Create Statement of Work (SOW)',
    'Finish completing the SOW',
    'Review Statement of Work',
    'Review Revised Statement of Work',
    'Update SOW with Revisions'
  ));
  
  -- Insert new action items based on the updated SOW status
  IF NEW.status = 'draft' THEN
    -- Coach action to complete SOW
    INSERT INTO public.project_action_items
    (project_id, title, description, priority, icon_name, action_type, action_data, for_role)
    VALUES
    (v_project_id, 'Finish completing the SOW', 'Complete the Statement of Work for this project', 'high', 
    'file-pen', 'sow', jsonb_build_object('route', '/project-sow/' || v_project_id), 'coach');
    
  ELSIF NEW.status = 'ready for review' THEN
    -- Resident action to review SOW
    -- Check if this is a revision
    IF v_previous_status = 'pending revision' THEN
      INSERT INTO public.project_action_items
      (project_id, title, description, priority, icon_name, action_type, action_data, for_role)
      VALUES
      (v_project_id, 'Review Revised Statement of Work', 'The revised Statement of Work is ready for your review', 
      'high', 'clipboard-check', 'navigate', 
      jsonb_build_object('route', '/project-sow/' || v_project_id || '?review=true&revised=true'), 'resident');
    ELSE
      INSERT INTO public.project_action_items
      (project_id, title, description, priority, icon_name, action_type, action_data, for_role)
      VALUES
      (v_project_id, 'Review Statement of Work', 'Review the scope of work before proceeding', 
      'high', 'clipboard-check', 'navigate', 
      jsonb_build_object('route', '/project-sow/' || v_project_id || '?review=true'), 'resident');
    END IF;
    
  ELSIF NEW.status = 'pending revision' THEN
    -- Coach action to revise SOW
    INSERT INTO public.project_action_items
    (project_id, title, description, priority, icon_name, action_type, action_data, for_role)
    VALUES
    (v_project_id, 'Update SOW with Revisions', 'Revisions requested by the resident need to be addressed', 
    'high', 'file-pen', 'sow', jsonb_build_object('route', '/project-sow/' || v_project_id), 'coach');
    
  ELSIF NEW.status IN ('draft', NULL) THEN
    -- Coach action to create SOW
    INSERT INTO public.project_action_items
    (project_id, title, description, priority, icon_name, action_type, action_data, for_role)
    VALUES
    (v_project_id, 'Create Statement of Work (SOW)', 'Draft a Statement of Work for this project', 
    'high', 'file-plus', 'sow', jsonb_build_object('route', '/project-sow/' || v_project_id), 'coach');
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
