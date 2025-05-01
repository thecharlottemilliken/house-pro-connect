
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
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
    
    // Extract specific operation if provided
    const operation = body.operation;
    
    // Handle getting project owner info
    if (operation === "get-project-owner" && body.projectId && body.userId) {
      const projectId = body.projectId;
      const userId = body.userId;
      
      try {
        // First check if user is the project owner
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('user_id')
          .eq('id', projectId)
          .maybeSingle();
          
        if (projectError) {
          console.error("Error fetching project:", projectError);
          return new Response(JSON.stringify({ error: projectError.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
        
        // If project not found, return 404
        if (!projectData) {
          return new Response(JSON.stringify({ error: "Project not found" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          });
        }
        
        const isOwner = projectData.user_id === userId;
        
        // If not owner, get their role from team members
        let role = null;
        
        if (!isOwner) {
          const { data: roleData, error: roleError } = await supabase
            .from('project_team_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (!roleError && roleData) {
            role = roleData.role;
          }
        }
        
        return new Response(JSON.stringify({
          isOwner,
          role: isOwner ? 'owner' : role,
          user_id: projectData.user_id
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Error getting project owner info:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }
    
    // Handle getting all user projects
    if (operation === "get-user-projects" && body.userId) {
      const userId = body.userId;
      
      try {
        // Get projects owned by user
        const { data: ownedProjects, error: ownedError } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            property_id,
            created_at,
            property:properties(
              property_name,
              image_url,
              address_line1,
              city,
              state,
              zip_code
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (ownedError) {
          throw ownedError;
        }
        
        // Mark owned projects
        const ownedProjectsWithRole = (ownedProjects || []).map(project => ({
          ...project,
          is_owner: true
        }));
        
        // Get team memberships
        const { data: teamMemberships, error: teamError } = await supabase
          .from('project_team_members')
          .select(`
            role,
            project_id
          `)
          .eq('user_id', userId);
        
        if (teamError) {
          throw teamError;
        }

        let teamProjects = [];
        
        // If user is a team member on any projects, fetch those projects
        if (teamMemberships && teamMemberships.length > 0) {
          const projectIds = teamMemberships.map(member => member.project_id);
          
          const { data: teamProjectsData, error: projectsError } = await supabase
            .from('projects')
            .select(`
              id,
              title,
              property_id,
              created_at,
              property:properties(
                property_name,
                image_url,
                address_line1,
                city,
                state,
                zip_code
              )
            `)
            .in('id', projectIds);
            
          if (projectsError) {
            throw projectsError;
          }
          
          // Match projects with their roles from teamMemberships
          teamProjects = (teamProjectsData || []).map(project => {
            const membership = teamMemberships.find(m => m.project_id === project.id);
            return {
              ...project,
              is_owner: false,
              team_role: membership?.role || 'Team Member'
            };
          });
        }
        
        // Combine and deduplicate the results
        const projectMap = new Map();
        
        // Add owned projects to the map first (they take precedence)
        ownedProjectsWithRole.forEach(project => {
          projectMap.set(project.id, project);
        });
        
        // Add team projects only if not already in the map
        teamProjects.forEach(project => {
          if (!projectMap.has(project.id)) {
            projectMap.set(project.id, project);
          }
        });
        
        // Convert map back to array
        const allProjects = Array.from(projectMap.values());
        
        return new Response(JSON.stringify({ projects: allProjects }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Error fetching user projects:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    // Get project details for dashboard
    if (body.projectId && body.userId && !body.operation) {
      const projectId = body.projectId;
      const userId = body.userId;

      try {
        // Check if user is a coach first
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        const isCoach = profileData?.role === 'coach';
        
        // If user is a coach, skip team membership check
        let hasAccess = isCoach;
        
        // If not a coach, check team membership
        if (!isCoach) {
          const { data: membershipData } = await supabase
            .rpc('check_team_membership', { 
              project_id_param: projectId, 
              user_id_param: userId
            });
          
          hasAccess = !!membershipData;
        }
        
        // If user doesn't have access, return 403
        if (!hasAccess) {
          return new Response(JSON.stringify({ error: "Access denied" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          });
        }
        
        // Fetch the project with all its details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .maybeSingle();

        if (projectError) {
          console.error("Error fetching project:", projectError);
          return new Response(JSON.stringify({ error: projectError.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        // If project not found, return 404
        if (!projectData) {
          return new Response(JSON.stringify({ error: "Project not found" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          });
        }

        return new Response(JSON.stringify(projectData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Error fetching project details:", error);
        return new Response(JSON.stringify({ error: error.message || "An error occurred" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    // Handle project update or creation
    if ((body.projectId || (body.propertyId && body.userId)) && 
        (body.title || body.renovationAreas || body.projectPreferences || 
         body.constructionPreferences || body.designPreferences || 
         body.managementPreferences || body.prior_experience)) {
          
      const projectId = body.projectId;
      const userId = body.userId;
      const propertyId = body.propertyId;
      const title = body.title || "";
      const renovationAreas = body.renovationAreas || [];
      const projectPreferences = body.projectPreferences || {};
      const constructionPreferences = body.constructionPreferences || {};
      const designPreferences = body.designPreferences || {};
      const managementPreferences = body.managementPreferences || {};
      const prior_experience = body.prior_experience || {};

      console.log("Processing project update with data:", JSON.stringify({
        projectId,
        userId,
        propertyId,
        title,
        renovationAreas: Array.isArray(renovationAreas) ? renovationAreas.length : 'not array',
        hasProjectPrefs: !!Object.keys(projectPreferences || {}).length,
        hasConstructionPrefs: !!Object.keys(constructionPreferences || {}).length,
        hasDesignPrefs: !!Object.keys(designPreferences || {}).length,
        hasManagementPrefs: !!Object.keys(managementPreferences || {}).length,
        hasPriorExp: !!Object.keys(prior_experience || {}).length
      }, null, 2));

      try {
        if (projectId) {
          // First get the existing project to verify it exists
          const { data: existingProject, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Error fetching project:", fetchError);
            return new Response(JSON.stringify({ error: fetchError.message }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            });
          }
          
          // If project not found, return 404
          if (!existingProject) {
            return new Response(JSON.stringify({ error: "Project not found" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
            });
          }
          
          // Update the project with the provided data
          const updateData: any = {};
          
          // Only update fields that are provided in the request
          if (propertyId) updateData.property_id = propertyId;
          if (title) updateData.title = title;
          if (renovationAreas.length > 0 || body.renovationAreas !== undefined) updateData.renovation_areas = renovationAreas;
          if (Object.keys(projectPreferences).length > 0 || body.projectPreferences !== undefined) updateData.project_preferences = projectPreferences;
          if (Object.keys(constructionPreferences).length > 0 || body.constructionPreferences !== undefined) updateData.construction_preferences = constructionPreferences;
          if (Object.keys(designPreferences).length > 0 || body.designPreferences !== undefined) updateData.design_preferences = designPreferences;
          if (Object.keys(managementPreferences).length > 0 || body.managementPreferences !== undefined) updateData.management_preferences = managementPreferences;
          if (Object.keys(prior_experience).length > 0 || body.prior_experience !== undefined) updateData.prior_experience = prior_experience;
          
          console.log("Updating project with data:", JSON.stringify(updateData, null, 2));
          
          const { data, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', projectId)
            .select()
            .single();

          if (error) {
            console.error("Error updating project:", error);
            return new Response(JSON.stringify({ error: error.message }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            });
          }

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (propertyId && userId) {
          // Create a new project
          console.log("Creating new project with data:", {
            propertyId,
            userId,
            title: title || "New Project"
          });
          
          const { data, error } = await supabase
            .from('projects')
            .insert({
              property_id: propertyId,
              user_id: userId,
              title: title || "New Project",
              renovation_areas: renovationAreas,
              project_preferences: projectPreferences,
              construction_preferences: constructionPreferences,
              design_preferences: designPreferences,
              management_preferences: managementPreferences,
              prior_experience: prior_experience
            })
            .select()
            .single();

          if (error) {
            console.error("Error creating project:", error);
            return new Response(JSON.stringify({ error: error.message }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            });
          }

          console.log("Created new project successfully:", data.id);
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      } catch (error) {
        console.error("Error handling project update:", error);
        return new Response(
          JSON.stringify({ error: error.message || "An error occurred" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
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
