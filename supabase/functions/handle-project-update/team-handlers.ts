
export async function handleProjectTeamAccess(supabase: any, body: any, corsHeaders: any) {
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
