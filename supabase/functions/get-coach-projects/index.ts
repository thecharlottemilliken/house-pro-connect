
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the JWT token from the authorization header
    const token = authHeader.replace("Bearer ", "");
    
    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token or user not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the user is a coach
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Error fetching user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profileData.role !== "coach") {
      return new Response(
        JSON.stringify({ error: "Access denied. User is not a coach" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all projects using service role (bypassing RLS)
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        id,
        title,
        created_at,
        state,
        user_id,
        property_id,
        management_preferences
      `)
      .order("created_at", { ascending: false });

    if (projectsError) {
      return new Response(
        JSON.stringify({ error: "Error fetching projects", details: projectsError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get unique property IDs and user IDs from projects
    const propertyIds = [...new Set(projects.map(p => p.property_id))];
    const userIds = [...new Set(projects.map(p => p.user_id))];
    const projectIds = projects.map(p => p.id);

    // Fetch properties data
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select(`
        id,
        property_name,
        address_line1,
        city,
        state
      `)
      .in("id", propertyIds);

    if (propertiesError) {
      return new Response(
        JSON.stringify({ error: "Error fetching properties", details: propertiesError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        email
      `)
      .in("id", userIds);

    if (profilesError) {
      return new Response(
        JSON.stringify({ error: "Error fetching profiles", details: profilesError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // NEW: Fetch coaching session events for these projects
    const { data: coachingEvents, error: eventsError } = await supabase
      .from("project_events")
      .select(`
        id,
        project_id,
        event_type
      `)
      .in("project_id", projectIds)
      .eq("event_type", "coaching_session");
    
    if (eventsError) {
      console.error("Error fetching coaching events:", eventsError);
      // Continue without events data rather than failing the whole request
    }

    // Create a map of projects that already have coaching sessions scheduled
    const projectsWithCoachingSessions = new Set(
      (coachingEvents || []).map(event => event.project_id)
    );
    
    console.log("Projects with coaching sessions:", Array.from(projectsWithCoachingSessions));

    // Map properties and users to dictionaries for quick lookup
    const propertiesMap = properties.reduce((acc, property) => {
      acc[property.id] = property;
      return acc;
    }, {});

    const profilesMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {});

    // Combine project data with property and user data
    const projectsWithData = projects.map(project => {
      const property = propertiesMap[project.property_id] || {
        property_name: "Unknown Property",
        address_line1: "Address not available",
        city: "Unknown",
        state: "Unknown",
      };

      const owner = profilesMap[project.user_id] || {
        id: project.user_id,
        name: `User ${project.user_id.substring(0, 6)}`,
        email: "email@unknown.com",
      };

      // Add flag indicating if a coaching session is already scheduled
      const hasCoachingSession = projectsWithCoachingSessions.has(project.id);

      return {
        id: project.id,
        title: project.title,
        created_at: project.created_at,
        state: project.state,
        property,
        owner,
        management_preferences: project.management_preferences,
        // Add the new flag
        hasCoachingSession
      };
    });

    return new Response(
      JSON.stringify({ projects: projectsWithData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-coach-projects:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
