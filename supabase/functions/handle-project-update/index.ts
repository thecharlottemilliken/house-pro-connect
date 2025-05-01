
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleProjectUpdate } from "./project-handlers.ts";
import { handleProjectTeamAccess } from "./team-handlers.ts";
import { handleUserProjects } from "./user-handlers.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body, null, 2));
    
    // Extract specific operation if provided
    const operation = body.operation;
    
    // Handle getting project owner info
    if (operation === "get-project-owner" && body.projectId && body.userId) {
      return await handleProjectTeamAccess(supabase, body, corsHeaders);
    }
    
    // Handle getting all user projects
    if (operation === "get-user-projects" && body.userId) {
      return await handleUserProjects(supabase, body, corsHeaders);
    }

    // Get project details for dashboard or handle project update/creation
    if (body.projectId || (body.propertyId && body.userId)) {
      return await handleProjectUpdate(supabase, body, corsHeaders);
    }

    return new Response(
      JSON.stringify({ error: "Invalid request parameters" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
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
