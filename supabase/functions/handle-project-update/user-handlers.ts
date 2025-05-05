export async function handleUserProjects(supabase, body, corsHeaders) {
  try {
    const userId = body.userId;
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // Get projects where the user is the owner
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
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
    
    // Add is_owner flag to owned projects
    const ownedProjectsWithRole = (ownedProjects || []).map(project => ({
      ...project,
      is_owner: true
    }));
    
    // Get projects where the user is a team member
    const { data: teamMemberships, error: teamError } = await supabase
      .from('project_team_members')
      .select('role, project_id')
      .eq('user_id', userId);
    
    if (teamError) {
      throw teamError;
    }
    
    let teamProjects = [];
    
    if (teamMemberships && teamMemberships.length > 0) {
      const projectIds = teamMemberships.map(member => member.project_id);
      
      const { data: teamProjectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
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
      
      // Match projects with roles
      teamProjects = (teamProjectsData || []).map(project => {
        const membership = teamMemberships.find(m => m.project_id === project.id);
        return {
          ...project,
          is_owner: false,
          team_role: membership?.role || 'Team Member'
        };
      });
    }
    
    // Combine and deduplicate projects
    const projectMap = new Map();
    
    // Add owned projects first (they take precedence)
    ownedProjectsWithRole.forEach(project => {
      projectMap.set(project.id, project);
    });
    
    // Add team projects if not already in map
    teamProjects.forEach(project => {
      if (!projectMap.has(project.id)) {
        projectMap.set(project.id, project);
      }
    });
    
    // Convert map to array
    const allProjects = Array.from(projectMap.values());
    
    return new Response(
      JSON.stringify({ projects: allProjects }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in handleUserProjects:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}
