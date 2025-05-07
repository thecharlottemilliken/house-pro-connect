
-- Create an RPC function to update action item completion status
CREATE OR REPLACE FUNCTION public.update_action_item_completion(item_id UUID, is_completed BOOLEAN)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  title TEXT,
  description TEXT,
  priority TEXT,
  icon_name TEXT,
  action_type TEXT,
  action_data JSONB,
  completed BOOLEAN,
  completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  for_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  UPDATE public.project_action_items
  SET 
    completed = is_completed,
    completion_date = CASE WHEN is_completed THEN now() ELSE NULL END
  WHERE id = item_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage to all authenticated users
GRANT EXECUTE ON FUNCTION public.update_action_item_completion(UUID, BOOLEAN) TO authenticated;
