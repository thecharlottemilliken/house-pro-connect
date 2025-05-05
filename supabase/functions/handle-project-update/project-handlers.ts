// Update the project handler function to include the description field

export async function handleProjectUpdate(supabase, body, corsHeaders) {
  try {
    // If we're just fetching project data
    if (body.projectId && !body.title) {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, property:properties(*)')
        .eq('id', body.projectId)
        .single();
      
      if (projectError) {
        throw projectError;
      }
      
      return new Response(
        JSON.stringify(project),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Otherwise, handle project creation or update
    let project_id = body.projectId || null;
    const property_id = body.propertyId;
    const user_id = body.userId;
    const title = body.title || 'New Renovation Project';
    const description = body.description || null;
    const renovation_areas = body.renovationAreas || [];
    const project_preferences = body.projectPreferences || {};
    const construction_preferences = body.constructionPreferences || {};
    const design_preferences = body.designPreferences || {};
    const management_preferences = body.managementPreferences || {};
    const prior_experience = body.prior_experience || {};
    
    // If we have a project ID, update it
    if (project_id) {
      console.log(`Updating project ${project_id}`);
      
      const { data, error } = await supabase
        .from('projects')
        .update({
          property_id,
          title,
          description,
          renovation_areas,
          project_preferences,
          construction_preferences,
          design_preferences,
          management_preferences,
          prior_experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', project_id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Otherwise, create a new project
    console.log(`Creating new project for property ${property_id}`);
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        property_id,
        user_id,
        title,
        description,
        renovation_areas,
        project_preferences,
        construction_preferences,
        design_preferences,
        management_preferences,
        prior_experience
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in handleProjectUpdate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}
