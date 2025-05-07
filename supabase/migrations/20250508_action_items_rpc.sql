
-- Create an RPC function to update action item completion status
CREATE OR REPLACE FUNCTION public.update_action_item_completion(item_id UUID, is_completed BOOLEAN)
RETURNS SETOF project_action_items AS $$
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
