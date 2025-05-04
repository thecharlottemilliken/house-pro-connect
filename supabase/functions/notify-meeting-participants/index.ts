
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
    console.log("[notify-meeting-participants] Starting function");
    
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
      console.error("[notify-meeting-participants] No authorization header provided");
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
      console.error("[notify-meeting-participants] Unauthorized access attempt:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body with event details
    const { eventData, coachName } = await req.json();
    console.log("[notify-meeting-participants] Meeting event data received:", eventData);
    
    if (!eventData || !eventData.project_id) {
      console.error("[notify-meeting-participants] Missing required event data");
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
      console.error("[notify-meeting-participants] Failed to fetch team members:", teamError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch team members", details: teamError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[notify-meeting-participants] Found ${teamMembers?.length || 0} team members to notify`);
    
    if (!teamMembers?.length) {
      console.log("[notify-meeting-participants] No team members to notify");
      return new Response(
        JSON.stringify({ message: "No team members to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get project details for the notification
    const { data: projectData, error: projectError } = await supabaseClient
      .from("projects")
      .select("title")
      .eq("id", eventData.project_id)
      .single();
    
    if (projectError) {
      console.error("[notify-meeting-participants] Failed to fetch project details:", projectError);
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
      try {
        // Get creator name
        const { data: creatorData, error: creatorError } = await supabaseClient
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();
        
        if (creatorError) {
          console.error(`[notify-meeting-participants] Error getting creator name for ${user.id}:`, creatorError);
        }
        
        const creatorName = creatorData?.name || coachName || "Your coach";
        
        console.log(`[notify-meeting-participants] Creating notification for team member ${member.user_id}`);
        
        // Create notification data
        const notificationData = {
          recipient_id: member.user_id,
          type: 'new_meeting',
          title: `${creatorName} has scheduled "${eventData.title}" on ${formattedDate}`,
          content: eventData.description || `Meeting for project: ${projectData.title}`,
          priority: 'high',
          data: {
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
          }
        };

        console.log("[notify-meeting-participants] Notification data:", notificationData);

        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('notifications')
          .insert(notificationData)
          .select();
        
        if (insertError) {
          console.error(`[notify-meeting-participants] Error creating notification for ${member.user_id}:`, insertError);
          return { success: false, error: insertError };
        }
        
        console.log(`[notify-meeting-participants] Successfully created notification for ${member.user_id}:`, insertData);
        return { success: true, data: insertData };
      } catch (error) {
        console.error(`[notify-meeting-participants] Error in notification creation for ${member.user_id}:`, error);
        return { success: false, error };
      }
    });

    // Wait for all notifications to be created
    const results = await Promise.all(notificationPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`[notify-meeting-participants] Sent ${successful} notifications to team members (${failed} failed)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${successful} team members (${failed} failed)`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("[notify-meeting-participants] Error in function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
