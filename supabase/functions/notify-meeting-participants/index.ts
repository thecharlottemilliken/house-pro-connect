
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

interface EventData {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  event_type: string;
  created_by: string;
}

interface NotifyMeetingRequest {
  eventData: EventData;
  coachName: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }
    
    // Use the service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    console.log("Notify-meeting-participants function started");
    const { eventData, coachName } = await req.json() as NotifyMeetingRequest;
    
    console.log("Received event data:", eventData);
    console.log("Coach name:", coachName);
    
    if (!eventData || !eventData.project_id || !eventData.id) {
      throw new Error("Missing required event data");
    }
    
    // Get project details
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('title, user_id')
      .eq('id', eventData.project_id)
      .single();
    
    if (projectError) {
      console.error("Error fetching project:", projectError);
      throw new Error(`Error fetching project: ${projectError.message}`);
    }
    
    // Format the date for notification
    const meetingDate = new Date(eventData.start_time);
    const formattedDate = meetingDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Get team members for this project
    const { data: teamMembers, error: teamError } = await supabaseAdmin
      .from('project_team_members')
      .select('user_id')
      .eq('project_id', eventData.project_id)
      .neq('user_id', eventData.created_by); // Skip the creator
    
    if (teamError) {
      console.error("Error fetching team members:", teamError);
      throw new Error(`Error fetching team members: ${teamError.message}`);
    }
    
    console.log(`Found ${teamMembers?.length || 0} team members to notify`);
    
    // Get creator info for the notification
    const { data: creatorData, error: creatorError } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', eventData.created_by)
      .single();
    
    if (creatorError) {
      console.error("Error fetching creator info:", creatorError);
    }
    
    const creatorName = coachName || creatorData?.name || "Your Coach";
    
    // Results tracking
    const results = {
      success: true,
      notificationsSent: 0,
      errors: [] as string[]
    };
    
    // Send notifications to each team member
    if (teamMembers && teamMembers.length > 0) {
      for (const member of teamMembers) {
        try {
          const notificationData = {
            recipient_id: member.user_id,
            type: 'new_meeting',
            title: `${creatorName} scheduled a meeting: ${eventData.title}`,
            content: eventData.description || `Meeting scheduled for ${formattedDate}`,
            priority: 'high',
            data: {
              users: [{
                id: eventData.created_by,
                name: creatorName,
                avatar: creatorName.substring(0, 1)
              }],
              meeting: {
                id: eventData.id,
                name: eventData.title,
                date: formattedDate
              },
              project: {
                id: eventData.project_id,
                name: project.title
              },
              availableActions: ['view_meeting', 'reschedule', 'mark_as_read']
            }
          };
          
          console.log(`Creating notification for user ${member.user_id}:`, notificationData);
          
          const { error: notificationError } = await supabaseAdmin
            .from('notifications')
            .insert(notificationData);
          
          if (notificationError) {
            console.error(`Error creating notification for user ${member.user_id}:`, notificationError);
            results.errors.push(`Failed to notify user ${member.user_id}: ${notificationError.message}`);
          } else {
            results.notificationsSent++;
            console.log(`Notification created for user ${member.user_id}`);
          }
        } catch (error) {
          console.error(`Error processing notification for user ${member.user_id}:`, error);
          results.errors.push(`Error for user ${member.user_id}: ${error.message}`);
        }
      }
    } else {
      console.log("No team members to notify");
    }
    
    // Update results
    results.success = results.errors.length === 0;
    
    return new Response(
      JSON.stringify(results),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in notify-meeting-participants function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "Internal server error" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
