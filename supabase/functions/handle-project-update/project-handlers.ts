
import { corsHeaders } from "./index.ts";

export async function handleProjectUpdate(supabase: any, body: any, corsHeaders: any) {
  // Log the full input body for debugging
  console.log("Project handler received body:", JSON.stringify(body, null, 2));
  
  // If just getting project details without modifying
  if (body.projectId && body.userId && !body.propertyId && !body.title) {
    return await getProjectDetails(supabase, body, corsHeaders);
  }

  // Handle project update or creation
  return await updateOrCreateProject(supabase, body, corsHeaders);
}

async function getProjectDetails(supabase: any, body: any, corsHeaders: any) {
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

    console.log("Returning project data:", projectData);
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

async function updateOrCreateProject(supabase: any, body: any, corsHeaders: any) {
  const projectId = body.projectId;
  const userId = body.userId;
  const propertyId = body.propertyId;
  const title = body.title || "";
  const description = body.description || null;
  const renovationAreas = body.renovationAreas || [];
  const projectPreferences = body.projectPreferences || {};
  const constructionPreferences = body.constructionPreferences || {};
  const designPreferences = body.designPreferences || {};
  const managementPreferences = body.managementPreferences || {};
  const priorExperience = body.priorExperience || {};

  console.log("Processing project update/create with data:", JSON.stringify({
    projectId,
    userId,
    propertyId,
    title,
    description,
    renovationAreas: Array.isArray(renovationAreas) ? renovationAreas.length : 'not array',
    hasProjectPrefs: !!Object.keys(projectPreferences || {}).length,
    hasConstructionPrefs: !!Object.keys(constructionPreferences || {}).length,
    hasDesignPrefs: !!Object.keys(designPreferences || {}).length,
    hasManagementPrefs: !!Object.keys(managementPreferences || {}).length,
    hasPriorExp: !!Object.keys(priorExperience || {}).length,
    renovationAreas,
    projectPreferences,
    constructionPreferences, 
    designPreferences,
    managementPreferences,
    priorExperience
  }, null, 2));

  try {
    if (projectId) {
      return await updateExistingProject(
        supabase, 
        projectId, 
        userId,
        propertyId,
        title, 
        description,
        renovationAreas,
        projectPreferences,
        constructionPreferences,
        designPreferences,
        managementPreferences,
        priorExperience,
        corsHeaders
      );
    } else if (propertyId && userId) {
      return await createNewProject(
        supabase, 
        propertyId, 
        userId, 
        title, 
        description,
        renovationAreas,
        projectPreferences,
        constructionPreferences, 
        designPreferences, 
        managementPreferences, 
        priorExperience,
        corsHeaders
      );
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

async function updateExistingProject(
  supabase: any, 
  projectId: string,
  userId: string,
  propertyId?: string,
  title?: string,
  description?: string,
  renovationAreas?: any[],
  projectPreferences?: any,
  constructionPreferences?: any,
  designPreferences?: any,
  managementPreferences?: any,
  priorExperience?: any,
  corsHeaders?: any
) {
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
  
  // Log the data that will be used for updating
  console.log("Project data before update:", JSON.stringify({
    projectId,
    userId,
    description,
    constructionPreferences,
    designPreferences,
    managementPreferences,
    priorExperience
  }, null, 2));

  // Update the project with the provided data
  const updateData: any = {};
  
  // Basic fields that are simple to update
  if (propertyId) updateData.property_id = propertyId;
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  
  // Always include all preference data that was sent in the request
  if (renovationAreas !== undefined) {
    updateData.renovation_areas = renovationAreas;
  }
  
  if (projectPreferences !== undefined) {
    updateData.project_preferences = projectPreferences;
  }
  
  if (constructionPreferences !== undefined) {
    console.log("Updating construction preferences with:", JSON.stringify(constructionPreferences, null, 2));
    updateData.construction_preferences = constructionPreferences;
  }
  
  if (designPreferences !== undefined) {
    console.log("Updating design preferences with:", JSON.stringify(designPreferences, null, 2));
    updateData.design_preferences = designPreferences;
  }
  
  if (managementPreferences !== undefined) {
    console.log("Updating management preferences with:", JSON.stringify(managementPreferences, null, 2));
    updateData.management_preferences = managementPreferences;
  }
  
  if (priorExperience !== undefined) {
    console.log("Updating prior experience with:", JSON.stringify(priorExperience, null, 2));
    updateData.prior_experience = priorExperience;
  }
  
  console.log("Final update data being sent:", JSON.stringify(updateData, null, 2));
  
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

  console.log("Successfully updated project:", data.id);
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function createNewProject(
  supabase: any, 
  propertyId: string, 
  userId: string,
  title: string,
  description: string | null,
  renovationAreas: any[],
  projectPreferences: any,
  constructionPreferences: any,
  designPreferences: any,
  managementPreferences: any,
  priorExperience: any,
  corsHeaders: any
) {
  console.log("Creating new project with data:", {
    propertyId,
    userId,
    title: title || "New Project",
    description,
    renovationAreas,
    projectPreferences,
    constructionPreferences,
    designPreferences,
    managementPreferences,
    priorExperience
  });
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      property_id: propertyId,
      user_id: userId,
      title: title || "New Project",
      description: description,
      renovation_areas: renovationAreas,
      project_preferences: projectPreferences,
      construction_preferences: constructionPreferences,
      design_preferences: designPreferences,
      management_preferences: managementPreferences,
      prior_experience: priorExperience
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
