
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

interface ProjectUpdateEvent {
  projectId: string;
  managementPreferences?: {
    wantProjectCoach?: string;
    timeSlots?: any[];
    [key: string]: any;
  };
  [key: string]: any;
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
    console.log("[notify-coaches-for-new-projects] Starting function");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }
    
    // Use the service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const requestData: ProjectUpdateEvent = await req.json();
    const { projectId, managementPreferences } = requestData;
    
    console.log(`[notify-coaches-for-new-projects] Project ID: ${projectId}, Management Preferences:`, managementPreferences);
    
    // Validate required fields
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    
    // Only proceed if the project has management preferences with coach request and time slots
    if (!managementPreferences?.wantProjectCoach || 
        managementPreferences.wantProjectCoach !== 'yes' || 
        !managementPreferences.timeSlots || 
        !managementPreferences.timeSlots.length) {
      console.log("[notify-coaches-for-new-projects] No coach request or time slots provided");
      return new Response(
        JSON.stringify({ message: 'No coach request or time slots provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the project already has a scheduled meetup time
    if (managementPreferences.scheduledMeetupTime) {
      console.log("[notify-coaches-for-new-projects] Project already has a scheduled meetup time - skipping notifications");
      return new Response(
        JSON.stringify({ message: 'Project already has scheduled meetup time' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[notify-coaches-for-new-projects] Checking project ${projectId} for coach notification`);

    // Get project details with the user information through a separate join
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        title,
        user_id
      `)
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectData) {
      console.error('[notify-coaches-for-new-projects] Error getting project data:', projectError);
      throw new Error('Could not fetch project data');
    }

    // Get user information separately
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', projectData.user_id)
      .single();
    
    if (userError || !userData) {
      console.error('[notify-coaches-for-new-projects] Error getting user data:', userError);
      throw new Error('Could not fetch user data');
    }

    // Get all coaches
    const { data: coaches, error: coachesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name')
      .eq('role', 'coach');
    
    if (coachesError) {
      console.error('[notify-coaches-for-new-projects] Error getting coaches:', coachesError);
      throw new Error('Could not fetch coaches');
    }
    
    console.log(`[notify-coaches-for-new-projects] Found ${coaches?.length || 0} coaches to notify`);
    
    if (!coaches || coaches.length === 0) {
      console.error('[notify-coaches-for-new-projects] No coaches found to notify');
      return new Response(
        JSON.stringify({ error: 'No coaches found to notify' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Create a notification for each coach
    const notificationResults = [];
    for (const coach of coaches) {
      console.log(`[notify-coaches-for-new-projects] Creating notification for coach ${coach.id} (${coach.name})`);
      
      const notificationData = {
        recipient_id: coach.id,
        type: 'project_coaching_request',
        title: `New project "${projectData.title}" needs coaching`,
        content: `${userData.name} has requested coaching help and provided time slots. Please schedule a consultation.`,
        priority: 'high',
        data: {
          project: {
            id: projectData.id,
            name: projectData.title,
          },
          users: [{
            id: projectData.user_id,
            name: userData.name,
            avatar: userData.name.substring(0, 1)
          }],
          availableActions: ['schedule_consultation', 'mark_as_read']
        }
      };
      
      console.log("[notify-coaches-for-new-projects] Notification data:", notificationData);
      
      try {
        // Direct insert using service role key to bypass RLS
        const { data: notification, error: notificationError } = await supabaseAdmin
          .from('notifications')
          .insert(notificationData)
          .select()
          .single();
        
        if (notificationError) {
          console.error(`[notify-coaches-for-new-projects] Error creating notification for coach ${coach.id}:`, notificationError);
          notificationResults.push({ coachId: coach.id, success: false, error: notificationError });
        } else {
          console.log(`[notify-coaches-for-new-projects] Created notification for coach ${coach.id}: ${notification.id}`);
          notificationResults.push({ coachId: coach.id, success: true, notificationId: notification.id });
        }
      } catch (error) {
        console.error(`[notify-coaches-for-new-projects] Unexpected error for coach ${coach.id}:`, error);
        notificationResults.push({ coachId: coach.id, success: false, error: "Unexpected error" });
      }
    }
    
    const successCount = notificationResults.filter(r => r.success).length;
    const failedCount = notificationResults.filter(r => !r.success).length;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${successCount} coaches (${failedCount} failed)`,
        results: notificationResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[notify-coaches-for-new-projects] Error in function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
