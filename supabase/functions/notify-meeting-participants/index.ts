
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authentication details
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from Bearer token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body with event details
    const { eventData, coachName } = await req.json();
    
    if (!eventData || !eventData.project_id) {
      return new Response(
        JSON.stringify({ error: "Missing required event data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all team members for the project except the creator of the event
    const { data: teamMembers, error: teamError } = await supabaseClient
      .from("project_team_members")
      .select("user_id, name, role")
      .eq("project_id", eventData.project_id)
      .neq("user_id", eventData.created_by);
    
    if (teamError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch team members", details: teamError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get project details for the notification
    const { data: projectData, error: projectError } = await supabaseClient
      .from("projects")
      .select("title")
      .eq("id", eventData.project_id)
      .single();
    
    if (projectError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch project details", details: projectError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startTime = new Date(eventData.start_time);
    const formattedDate = startTime.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = startTime.toLocaleTimeString("en-US", {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create notifications for each team member
    const notificationPromises = teamMembers.map(async (member) => {
      // Get creator name
      const { data: creatorData } = await supabaseClient
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      
      const creatorName = creatorData?.name || coachName || "Your coach";
      
      // Create notification data
      const notificationData = {
        users: [{
          id: user.id,
          name: creatorName,
          avatar: creatorName.substring(0, 1)
        }],
        meeting: {
          id: eventData.id,
          name: eventData.title,
          date: `${formattedDate}, ${formattedTime}`
        },
        project: {
          id: eventData.project_id,
          name: projectData.title
        },
        availableActions: ['view_meeting', 'reschedule', 'mark_as_read']
      };

      // Insert notification using the database function
      return supabaseAdmin.rpc('create_notification', {
        p_recipient_id: member.user_id,
        p_type: 'new_meeting',
        p_title: `${creatorName} has scheduled "${eventData.title}" on ${formattedDate}`,
        p_content: eventData.description || `Meeting for project: ${projectData.title}`,
        p_priority: 'high',
        p_data: notificationData
      });
    });

    // Wait for all notifications to be created
    await Promise.all(notificationPromises);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${teamMembers.length} team members`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Error in notify-meeting-participants function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
