
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
    console.log("Creating project event:", event);
    
    // Use a direct query without type checking for now
    const { data, error } = await (supabase as any)
      .from('project_events')
      .insert(event)
      .select();
      
    if (error) {
      console.error("Error creating project event:", error);
      throw error;
    }
    
    console.log("Successfully created project event:", data?.[0]);
    return data?.[0];
  },
  
  async getProjectEvents(projectId: string) {
    console.log("Fetching project events for:", projectId);
    
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
    
    console.log(`Found ${data?.length || 0} project events`);
    return data as ProjectEvent[];
  },

  async notifyEventParticipants(event: ProjectEvent, creatorName: string) {
    try {
      console.log("Calling notify-meeting-participants edge function", {
        eventData: event,
        creatorName
      });
      
      // Call the edge function to notify participants
      const { data, error } = await supabase.functions.invoke(
        'notify-meeting-participants',
        {
          body: { 
            eventData: event,
            coachName: creatorName
          }
        }
      );

      if (error) {
        console.error("Error sending meeting notifications:", error);
        return false;
      }
      
      console.log("Meeting notification response:", data);
      return true;
    } catch (error) {
      console.error("Error in notifyEventParticipants:", error);
      return false;
    }
  }
};
