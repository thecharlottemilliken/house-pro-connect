
import { supabase } from "@/integrations/supabase/client";

export interface ProjectEvent {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  event_type: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export const EventsService = {
  async createProjectEvent(event: ProjectEvent) {
    // Use a direct query without type checking for now
    const { data, error } = await (supabase as any)
      .from('project_events')
      .insert(event)
      .select();
      
    if (error) {
      console.error("Error creating project event:", error);
      throw error;
    }
    
    return data?.[0];
  },
  
  async getProjectEvents(projectId: string) {
    // Use a direct query without type checking for now
    const { data, error } = await (supabase as any)
      .from('project_events')
      .select('*')
      .eq('project_id', projectId)
      .order('start_time', { ascending: true });
      
    if (error) {
      console.error("Error fetching project events:", error);
      throw error;
    }
    
    return data as ProjectEvent[];
  }
};
