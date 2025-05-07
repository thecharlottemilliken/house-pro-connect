
-- Fix the function to work with the profiles table structure (id instead of user_id)
CREATE OR REPLACE FUNCTION public.generate_sow_action_items()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_coach_id UUID;
  v_existing_item_id UUID;
BEGIN
  -- Get project ID
  v_project_id := NEW.project_id;
  
  -- Find coach for this project
  SELECT user_id INTO v_coach_id
  FROM public.project_team_members
  WHERE project_id = v_project_id AND role = 'coach'
  LIMIT 1;
  
  IF v_coach_id IS NULL THEN
    -- No coach found, nothing to do
    RETURN NEW;
  END IF;

  -- Check for existing action item for this SOW
  SELECT id INTO v_existing_item_id
  FROM public.project_action_items
  WHERE project_id = v_project_id 
    AND action_type = 'sow' 
    AND completed = false;
    
  -- Delete any existing SOW action items for this project
  DELETE FROM public.project_action_items
  WHERE project_id = v_project_id AND action_type = 'sow' AND completed = false;
  
  -- Create appropriate action item based on SOW status
  IF NEW.status = 'draft' OR NEW.status IS NULL THEN
    -- SOW is in draft, create task to finish it
    INSERT INTO public.project_action_items (
      project_id, 
      title, 
      description, 
      priority, 
      icon_name, 
      action_type, 
      action_data, 
      for_role
    ) VALUES (
      v_project_id,
      'Finish completing the SOW',
      'Complete the Statement of Work for this project',
      'high',
      'file-pen',
      'sow',
      jsonb_build_object('route', '/project-sow/' || v_project_id),
      'coach'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the function for generating initial action items
CREATE OR REPLACE FUNCTION public.generate_initial_action_items()
RETURNS TRIGGER AS $$
DECLARE
  v_sow_exists BOOLEAN;
  v_sow_status TEXT;
  v_coach_id UUID;
BEGIN
  -- Check if SOW exists for this project
  SELECT EXISTS (
    SELECT 1 FROM public.statement_of_work WHERE project_id = NEW.id
  ) INTO v_sow_exists;
  
  -- Find coach for this project
  SELECT id INTO v_coach_id
  FROM public.profiles
  WHERE role = 'coach'
  LIMIT 1;
  
  IF NOT v_sow_exists AND v_coach_id IS NOT NULL THEN
    -- No SOW exists, create initial SOW action item
    INSERT INTO public.project_action_items (
      project_id, 
      title, 
      description, 
      priority, 
      icon_name, 
      action_type, 
      action_data, 
      for_role
    ) VALUES (
      NEW.id,
      'Create Statement of Work',
      'Draft a Statement of Work for this project',
      'high',
      'file-plus',
      'sow',
      jsonb_build_object('route', '/project-sow/' || NEW.id),
      'coach'
    );
  ELSE
    -- SOW exists, check status
    SELECT status INTO v_sow_status
    FROM public.statement_of_work
    WHERE project_id = NEW.id;
    
    IF v_sow_status = 'draft' AND v_coach_id IS NOT NULL THEN
      -- SOW is in draft, create task to finish it
      INSERT INTO public.project_action_items (
        project_id, 
        title, 
        description, 
        priority, 
        icon_name, 
        action_type, 
        action_data, 
        for_role
      ) VALUES (
        NEW.id,
        'Finish completing the SOW',
        'Complete the Statement of Work for this project',
        'high',
        'file-pen',
        'sow',
        jsonb_build_object('route', '/project-sow/' || NEW.id),
        'coach'
      );
    END IF;
  END IF;

  -- Handle design-related action items for project owner
  IF NEW.design_preferences IS NULL OR 
     NOT (NEW.design_preferences ? 'beforePhotos') OR 
     (NEW.design_preferences->'beforePhotos' = '{}'::jsonb) THEN
    -- No before photos, create action item
    INSERT INTO public.project_action_items (
      project_id, 
      title, 
      description, 
      priority, 
      icon_name, 
      action_type, 
      action_data, 
      for_role
    ) VALUES (
      NEW.id,
      'Upload Before Photos',
      'Add photos of your current space',
      'medium',
      'camera',
      'navigate',
      jsonb_build_object('route', '/project-design/' || NEW.id),
      'owner'
    );
  END IF;
  
  IF NEW.design_preferences IS NULL OR 
     NOT (NEW.design_preferences ? 'roomMeasurements') OR 
     (NEW.design_preferences->'roomMeasurements' = '{}'::jsonb) THEN
    -- No room measurements, create action item
    INSERT INTO public.project_action_items (
      project_id, 
      title, 
      description, 
      priority, 
      icon_name, 
      action_type, 
      action_data, 
      for_role
    ) VALUES (
      NEW.id,
      'Add Room Measurements',
      'Provide accurate measurements for design planning',
      'medium',
      'ruler',
      'navigate',
      jsonb_build_object('route', '/project-design/' || NEW.id),
      'owner'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the function for generating action items for existing projects
CREATE OR REPLACE FUNCTION public.generate_initial_action_items_for_project(p_project_id UUID)
RETURNS void AS $$
DECLARE
  v_project_record public.projects%ROWTYPE;
  v_sow_exists BOOLEAN;
  v_sow_status TEXT;
  v_coach_id UUID;
BEGIN
  -- Get project data
  SELECT * INTO v_project_record
  FROM public.projects
  WHERE id = p_project_id;
  
  IF v_project_record.id IS NULL THEN
    RETURN; -- Project not found
  END IF;

  -- Check if SOW exists for this project
  SELECT EXISTS (
    SELECT 1 FROM public.statement_of_work WHERE project_id = p_project_id
  ) INTO v_sow_exists;
  
  -- Find coach for this project
  SELECT id INTO v_coach_id
  FROM public.profiles
  WHERE role = 'coach'
  LIMIT 1;
  
  IF NOT v_sow_exists AND v_coach_id IS NOT NULL THEN
    -- No SOW exists, create initial SOW action item
    INSERT INTO public.project_action_items (
      project_id, 
      title, 
      description, 
      priority, 
      icon_name, 
      action_type, 
      action_data, 
      for_role
    ) VALUES (
      p_project_id,
      'Create Statement of Work',
      'Draft a Statement of Work for this project',
      'high',
      'file-plus',
      'sow',
      jsonb_build_object('route', '/project-sow/' || p_project_id),
      'coach'
    );
  ELSE
    -- SOW exists, check status
    SELECT status INTO v_sow_status
    FROM public.statement_of_work
    WHERE project_id = p_project_id;
    
    IF v_sow_status = 'draft' AND v_coach_id IS NOT NULL THEN
      -- SOW is in draft, create task to finish it
      INSERT INTO public.project_action_items (
        project_id, 
        title, 
        description, 
        priority, 
        icon_name, 
        action_type, 
        action_data, 
        for_role
      ) VALUES (
        p_project_id,
        'Finish completing the SOW',
        'Complete the Statement of Work for this project',
        'high',
        'file-pen',
        'sow',
        jsonb_build_object('route', '/project-sow/' || p_project_id),
        'coach'
      );
    END IF;
  END IF;

  -- Handle design-related action items
  IF v_project_record.design_preferences IS NULL OR 
     NOT (v_project_record.design_preferences ? 'beforePhotos') OR 
     (v_project_record.design_preferences->'beforePhotos' = '{}'::jsonb) THEN
    -- No before photos, create action item
    INSERT INTO public.project_action_items (
      project_id, 
      title, 
      description, 
      priority, 
      icon_name, 
      action_type, 
      action_data, 
      for_role
    ) VALUES (
      p_project_id,
      'Upload Before Photos',
      'Add photos of your current space',
      'medium',
      'camera',
      'navigate',
      jsonb_build_object('route', '/project-design/' || p_project_id),
      'owner'
    );
  END IF;
  
  IF v_project_record.design_preferences IS NULL OR 
     NOT (v_project_record.design_preferences ? 'roomMeasurements') OR 
     (v_project_record.design_preferences->'roomMeasurements' = '{}'::jsonb) THEN
    -- No room measurements, create action item
    INSERT INTO public.project_action_items (
      project_id, 
      title, 
      description, 
      priority, 
      icon_name, 
      action_type, 
      action_data, 
      for_role
    ) VALUES (
      p_project_id,
      'Add Room Measurements',
      'Provide accurate measurements for design planning',
      'medium',
      'ruler',
      'navigate',
      jsonb_build_object('route', '/project-design/' || p_project_id),
      'owner'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
