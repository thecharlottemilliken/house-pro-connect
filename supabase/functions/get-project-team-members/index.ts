
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get request body
    const { projectId } = await req.json();
    
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get the project owner first
    const { data: projectData, error: projectError } = await supabaseClient
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) {
      console.error("Error fetching project owner:", projectError);
      return new Response(
        JSON.stringify({ error: projectError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!projectData) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First get the project owner's profile information
    let teamMembers = [];
    
    // Get owner's profile from profiles table
    const { data: ownerProfile, error: ownerError } = await supabaseClient
      .from('profiles')
      .select('id, name, email')
      .eq('id', projectData.user_id)
      .maybeSingle();
    
    if (ownerError) {
      console.error("Error fetching owner profile:", ownerError);
    } else if (ownerProfile) {
      // Add owner to team members list with direct profile data
      teamMembers.push({
        id: ownerProfile.id,
        role: 'owner',
        user_id: ownerProfile.id,
        name: ownerProfile.name || 'Project Owner',
        email: ownerProfile.email || 'No email'
      });
    } else {
      // Fallback if profile not found - get email from auth.users
      const { data: ownerAuth, error: authError } = await supabaseClient.auth.admin.getUserById(
        projectData.user_id
      );
      
      if (authError) {
        console.error("Error fetching owner auth data:", authError);
      } else if (ownerAuth && ownerAuth.user) {
        teamMembers.push({
          id: projectData.user_id, 
          role: 'owner',
          user_id: projectData.user_id,
          name: ownerAuth.user.user_metadata?.name || 'Project Owner',
          email: ownerAuth.user.email || 'No email'
        });
      }
    }

    // Query for all team members including coaches
    const { data: allTeamMembers, error: membersError } = await supabaseClient
      .from('project_team_members')
      .select('id, role, user_id, name, email')
      .eq('project_id', projectId);
    
    if (membersError) {
      console.error("Error fetching team members:", membersError);
    } else if (allTeamMembers && allTeamMembers.length > 0) {
      // Merge team members into the list
      allTeamMembers.forEach(member => {
        // Check if member is not already in the list (avoiding owner duplication)
        const isDuplicate = teamMembers.some(existingMember => 
          existingMember.user_id === member.user_id
        );
        
        if (!isDuplicate) {
          teamMembers.push({
            id: member.id,
            role: member.role,
            user_id: member.user_id,
            name: member.name || 'Team Member',
            email: member.email || 'No email'
          });
        }
      });
    }

    // Debug log
    console.log(`Found ${teamMembers.length} team members for project ${projectId}`);

    return new Response(
      JSON.stringify(teamMembers),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
