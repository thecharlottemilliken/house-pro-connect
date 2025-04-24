
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
        email: ownerProfile.email || 'No email',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerProfile.name || ownerProfile.email || 'owner')}`
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
          email: ownerAuth.user.email || 'No email',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerAuth.user.email || 'owner')}`
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
      // For each team member that has a user_id but missing name/email, try to get their profile data
      const usersToLookup = allTeamMembers
        .filter(member => member.user_id && (!member.name || !member.email))
        .map(member => member.user_id);
      
      let userProfiles = {};
      
      if (usersToLookup.length > 0) {
        // Get profile data for users with missing information
        const { data: profiles } = await supabaseClient
          .from('profiles')
          .select('id, name, email')
          .in('id', usersToLookup);
          
        // Also get auth data as backup
        const authPromises = usersToLookup.map(userId => 
          supabaseClient.auth.admin.getUserById(userId)
            .then(({data}) => data?.user)
            .catch(() => null)
        );
        
        const authUsers = await Promise.all(authPromises);
        
        // Create a lookup object for quick access
        if (profiles) {
          profiles.forEach(profile => {
            userProfiles[profile.id] = profile;
          });
        }
        
        // Add auth data as fallback
        authUsers.forEach((authUser, index) => {
          if (authUser && usersToLookup[index]) {
            const userId = usersToLookup[index];
            if (!userProfiles[userId]) {
              userProfiles[userId] = {
                id: userId,
                name: authUser.user_metadata?.name,
                email: authUser.email
              };
            }
          }
        });
      }
      
      // Merge team members into the list with enhanced profile data
      allTeamMembers.forEach(member => {
        // Check if member is not already in the list (avoiding owner duplication)
        const isDuplicate = teamMembers.some(existingMember => 
          existingMember.user_id === member.user_id
        );
        
        if (!isDuplicate) {
          // Try to get name and email from profiles if missing
          let name = member.name;
          let email = member.email;
          
          // If user_id exists and either name or email is missing, try to get from profile data
          if (member.user_id && (!name || !email) && userProfiles[member.user_id]) {
            name = name || userProfiles[member.user_id].name;
            email = email || userProfiles[member.user_id].email;
          }
          
          // Ensure we have some value
          name = name || (member.role === 'coach' ? 'Coach' : 'Team Member');
          email = email || 'No email';
          
          const avatarSeed = name !== 'Coach' && name !== 'Team Member' 
            ? name 
            : (email !== 'No email' ? email : `user-${member.id.substring(0,8)}`);
          
          teamMembers.push({
            id: member.id,
            role: member.role,
            user_id: member.user_id,
            name: name,
            email: email,
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`
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
