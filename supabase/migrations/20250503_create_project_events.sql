
-- Create project_events table for calendar events
CREATE TABLE IF NOT EXISTS public.project_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  event_type TEXT NOT NULL, -- 'meeting', 'milestone', 'coaching_session', etc.
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for project_events
ALTER TABLE public.project_events ENABLE ROW LEVEL SECURITY;

-- Team members can view events for their projects
CREATE POLICY "Team members can view project events" 
ON public.project_events 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_team_members ptm
    WHERE ptm.project_id = project_events.project_id AND ptm.user_id = auth.uid()
  )
);

-- Team members can insert events for their projects
CREATE POLICY "Team members can insert project events" 
ON public.project_events 
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_team_members ptm
    WHERE ptm.project_id = project_events.project_id AND ptm.user_id = auth.uid()
  )
);

-- Users can update events they created
CREATE POLICY "Users can update events they created" 
ON public.project_events 
FOR UPDATE
USING (created_by = auth.uid());

-- Users can delete events they created
CREATE POLICY "Users can delete events they created" 
ON public.project_events 
FOR DELETE
USING (created_by = auth.uid());

-- Add an index for faster lookups by project
CREATE INDEX project_events_project_id_idx ON public.project_events (project_id);

-- Add trigger to update updated_at on changes
CREATE TRIGGER update_project_events_updated_at
BEFORE UPDATE ON public.project_events
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
