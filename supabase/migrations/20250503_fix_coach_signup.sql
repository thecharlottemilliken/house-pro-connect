
-- Drop any existing grants to avoid conflicts
DROP FUNCTION IF EXISTS public.grant_coach_role CASCADE;

-- Fix the handle_new_user trigger function to avoid creating roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'resident')
  );
  RETURN new;
END;
$$;

-- Add a new function to safely set coach claim without creating roles
CREATE OR REPLACE FUNCTION public.handle_coach_claim_safely()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update metadata if the role is being set to coach
  IF NEW.role = 'coach' AND (OLD.role IS NULL OR OLD.role <> 'coach') THEN
    -- Use the auth.users admin API to set app_metadata
    -- This doesn't attempt to create database roles
    PERFORM
      supabase_functions.http(
        'POST',
        CONCAT(current_setting('app.settings.supabase_url'), '/auth/v1/admin/users/', NEW.id),
        ARRAY[
          ARRAY['Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))],
          ARRAY['Content-Type', 'application/json']
        ],
        '{"app_metadata": {"app_role": "coach"}}'
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a trigger that fires when a profile's role is updated to coach
DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'coach')
  EXECUTE FUNCTION public.handle_coach_claim_safely();
