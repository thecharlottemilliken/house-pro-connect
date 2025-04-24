
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { propertyId, userId } = await req.json();

    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: "Property ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // First check if user is a coach
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    const isCoach = profileData?.role === 'coach';

    // If coach, allow direct access to property
    if (isCoach) {
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();

      if (propertyError) {
        console.error("Error fetching property:", propertyError);
        return new Response(
          JSON.stringify({ error: propertyError.message }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      if (!propertyData) {
        return new Response(
          JSON.stringify({ error: "Property not found" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }

      return new Response(
        JSON.stringify(propertyData),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } 
    
    // Not a coach, check project access
    try {
      // Check if the property is associated with a project the user has access to
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("property_id", propertyId)
        .eq("user_id", userId);

      if (projectError) {
        console.error("Error checking project access:", projectError);
      } else if (projectData && projectData.length > 0) {
        // User is the owner of a project with this property
        const { data: propertyData, error: propertyError } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .maybeSingle();

        if (propertyError) throw propertyError;
        if (!propertyData) throw new Error("Property not found");

        return new Response(
          JSON.stringify(propertyData),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Check if the user has team membership on any project with this property
      const { data: teamProjects, error: teamError } = await supabase
        .from("projects")
        .select("id, property_id")
        .eq("property_id", propertyId);

      if (teamError) {
        console.error("Error checking team projects:", teamError);
        throw teamError;
      }

      if (teamProjects && teamProjects.length > 0) {
        // Check if the user is a team member on any of these projects
        const projectIds = teamProjects.map((project) => project.id);

        for (const projId of projectIds) {
          const { data: isMember } = await supabase.rpc("check_team_membership", {
            project_id_param: projId,
            user_id_param: userId,
          });

          if (isMember) {
            // User has team access to this project
            const { data: propertyData, error: propertyError } = await supabase
              .from("properties")
              .select("*")
              .eq("id", propertyId)
              .maybeSingle();

            if (propertyError) throw propertyError;
            if (!propertyData) throw new Error("Property not found");

            return new Response(
              JSON.stringify(propertyData),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          }
        }
      }

      // Finally, check if this is the user's own property
      const { data: ownProperty, error: ownError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .eq("user_id", userId)
        .maybeSingle();

      if (ownError) {
        console.error("Error checking own property:", ownError);
        throw ownError;
      }

      if (ownProperty) {
        return new Response(
          JSON.stringify(ownProperty),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // User doesn't have access
      return new Response(
        JSON.stringify({ error: "You don't have access to this property" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    } catch (error) {
      console.error("Error checking project access:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Internal server error" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Unexpected server error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
