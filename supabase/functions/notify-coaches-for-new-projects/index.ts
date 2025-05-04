
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const requestData: ProjectUpdateEvent = await req.json();
    const { projectId, managementPreferences } = requestData;
    
    // Only proceed if the project has management preferences with coach request and time slots
    if (!managementPreferences?.wantProjectCoach || 
        managementPreferences.wantProjectCoach !== 'yes' || 
        !managementPreferences.timeSlots || 
        !managementPreferences.timeSlots.length) {
      return new Response(
        JSON.stringify({ message: 'No coach request or time slots provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Checking project ${projectId} for coach notification`);

    // Get project details with the user information through a separate join
    const { data: projectData, error: projectError } = await supabaseClient
      .from('projects')
      .select(`
        id,
        title,
        user_id
      `)
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectData) {
      console.error('Error getting project data:', projectError);
      throw new Error('Could not fetch project data');
    }

    // Get user information separately
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('name, email')
      .eq('id', projectData.user_id)
      .single();
    
    if (userError || !userData) {
      console.error('Error getting user data:', userError);
      throw new Error('Could not fetch user data');
    }

    // Get all coaches
    const { data: coaches, error: coachesError } = await supabaseClient
      .from('profiles')
      .select('id, name')
      .eq('role', 'coach');
    
    if (coachesError || !coaches) {
      console.error('Error getting coaches:', coachesError);
      throw new Error('Could not fetch coaches');
    }
    
    console.log(`Found ${coaches.length} coaches to notify`);
    
    // Create a notification for each coach
    const notificationResults = [];
    for (const coach of coaches) {
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
      
      const { data: notification, error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      
      if (notificationError) {
        console.error(`Error creating notification for coach ${coach.id}:`, notificationError);
        notificationResults.push({ coachId: coach.id, success: false, error: notificationError });
      } else {
        console.log(`Created notification for coach ${coach.id}: ${notification.id}`);
        notificationResults.push({ coachId: coach.id, success: true, notificationId: notification.id });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${coaches.length} coaches`,
        results: notificationResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in notify-coaches function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
