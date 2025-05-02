
-- Fix the handle_coach_claim_safely function to ensure it sets claims correctly
CREATE OR REPLACE FUNCTION public.handle_coach_claim_safely()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update metadata if the role is being set to coach
  IF NEW.role = 'coach' AND (OLD.role IS NULL OR OLD.role <> 'coach') THEN
    -- Use the supabase_functions.http to call our set-claims edge function
    -- This is a more reliable approach than trying to set app_metadata directly
    PERFORM
      supabase_functions.http(
        'POST',
        CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/set-claims'),
        ARRAY[
          ARRAY['Content-Type', 'application/json']
        ],
        json_build_object('user_id', NEW.id)::text
      );
  END IF;
  
  RETURN NEW;
END;
$$;
