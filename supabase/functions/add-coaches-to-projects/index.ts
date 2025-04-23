
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Parse request body for optional projectId parameter
    const { projectId } = await req.json();
    let result;
    
    // If projectId is provided, add coaches to just this project
    if (projectId) {
      console.log(`Adding coaches to specific project: ${projectId}`);
      
      // Get coaches from profiles
      const { data: coaches, error: coachError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'coach');
      
      if (coachError) {
        throw coachError;
      }
      
      if (!coaches || coaches.length === 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: "No coaches found in the system" 
        }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      // Get project owner
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        throw projectError;
      }
      
      if (!project) {
        return new Response(JSON.stringify({ error: "Project not found" }), { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      // Add each coach to the project
      for (const coach of coaches) {
        await supabase
          .from('project_team_members')
          .insert({
            project_id: projectId,
            user_id: coach.id,
            role: 'coach',
            added_by: project.user_id
          })
          .on_conflict(['project_id', 'user_id'])
          .ignore();
      }
      
      result = { success: true, message: `Coaches added to project ${projectId}` };
    } else {
      // Call the database function to add coaches to all projects
      const { data, error } = await supabase.rpc('add_coaches_to_all_projects');

      if (error) {
        console.error("Error adding coaches to projects:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      result = { success: true, message: "Coaches have been added to all projects" };
    }

    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
