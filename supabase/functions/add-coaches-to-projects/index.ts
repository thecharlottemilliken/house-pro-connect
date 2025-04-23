
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
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false } // Explicitly disable session persistence
    });

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
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Verify if the user is a coach or project owner before proceeding
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ error: 'Error verifying user role', details: profileError.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Parse request body for optional projectId parameter
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    
    const { projectId } = body;
    let result;
    
    // If projectId is provided, add coaches to just this project
    if (projectId) {
      console.log(`Adding coaches to specific project: ${projectId}`);
      
      // Check if user is the project owner or a coach
      const { data: projectAccess, error: accessError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();
      
      const isOwner = projectAccess?.user_id === user.id;
      const isCoach = userProfile?.role === 'coach';
      
      if (accessError && !isCoach) {
        return new Response(JSON.stringify({ error: 'Error verifying project access', details: accessError.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      if (!isOwner && !isCoach) {
        return new Response(JSON.stringify({ error: 'Unauthorized - Only project owners and coaches can add coaches' }), { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      // Get coaches from profiles
      const { data: coaches, error: coachError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'coach');
      
      if (coachError) {
        return new Response(JSON.stringify({ error: 'Error fetching coaches', details: coachError.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
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
        return new Response(JSON.stringify({ error: 'Error fetching project', details: projectError.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      if (!project) {
        return new Response(JSON.stringify({ error: "Project not found" }), { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      // Add each coach to the project
      let addedCount = 0;
      for (const coach of coaches) {
        try {
          const { data, error } = await supabase
            .from('project_team_members')
            .insert({
              project_id: projectId,
              user_id: coach.id,
              role: 'coach',
              added_by: user.id
            })
            .select()
            .on_conflict(['project_id', 'user_id'])
            .ignore();
          
          if (!error) {
            addedCount++;
          }
        } catch (err) {
          console.error(`Error adding coach ${coach.id}:`, err);
        }
      }
      
      result = { 
        success: true, 
        message: `${addedCount} coaches added to project ${projectId}`,
        addedCount 
      };
    } else {
      // Only allow coaches or system admins to add coaches to all projects
      if (userProfile?.role !== 'coach') {
        return new Response(JSON.stringify({ error: 'Unauthorized - Only coaches can add coaches to all projects' }), { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
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
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
