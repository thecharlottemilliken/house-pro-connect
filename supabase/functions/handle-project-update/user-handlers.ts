
export async function handleUserProjects(supabase: any, body: any, corsHeaders: any) {
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
