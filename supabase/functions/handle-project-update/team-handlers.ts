
export async function handleProjectTeamAccess(supabase, body, corsHeaders) {
  try {
    const projectId = body.projectId;
    const userId = body.userId;
    
    if (!projectId || !userId) {
      throw new Error("Project ID and User ID are required");
    }
    
    // Check if user is project owner
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('user_id, title, description')
      .eq('id', projectId)
      .single();
      
    if (projectError) {
      throw projectError;
    }
    
    const isOwner = projectData.user_id === userId;
    
    // Get owner profile info
    const { data: ownerData, error: ownerError } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .eq('id', projectData.user_id)
      .single();
      
    if (ownerError) {
      throw ownerError;
    }
    
    // Check if user is a team member
    const { data: memberData, error: memberError } = await supabase
      .from('project_team_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId);
      
    if (memberError) {
      throw memberError;
    }
    
    const isMember = memberData && memberData.length > 0;
    const role = isMember ? memberData[0].role : null;
    
    return new Response(
      JSON.stringify({
        isOwner,
        isMember,
        role,
        ownerInfo: ownerData,
        projectTitle: projectData.title,
        projectDescription: projectData.description
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in handleProjectTeamAccess:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}
