
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
    const { 
      projectId, 
      userId, 
      propertyId, 
      title,
      renovationAreas,
      projectPreferences,
      constructionPreferences,
      designPreferences,
      managementPreferences,
      priorExperience
    } = await req.json();
    
    if (!projectId || !userId) {
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
    
    // First check if the project exists and if the user is authorized to update it
    const { data: projectData, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .maybeSingle();
      
    if (projectError) {
      console.error('Error checking project:', projectError);
      return new Response(
        JSON.stringify({ error: projectError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user is the project owner
    let canUpdate = false;
    if (projectData) {
      if (projectData.user_id === userId) {
        canUpdate = true;
      } else {
        // Check if user is a team member
        const { data: isMember, error: membershipError } = await supabaseClient
          .from('project_team_members')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (membershipError) {
          console.error('Error checking team membership:', membershipError);
        } else {
          canUpdate = !!isMember;
        }
      }
    }
    
    if (!canUpdate) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to update this project' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare the update object with only fields that have values
    const updateObject: any = {};
    
    if (propertyId !== undefined && propertyId !== null) updateObject.property_id = propertyId;
    if (title) updateObject.title = title;
    if (renovationAreas) updateObject.renovation_areas = renovationAreas;
    if (projectPreferences) updateObject.project_preferences = projectPreferences;
    if (constructionPreferences) updateObject.construction_preferences = constructionPreferences;
    if (designPreferences) updateObject.design_preferences = designPreferences;
    if (managementPreferences) updateObject.management_preferences = managementPreferences;
    if (priorExperience) updateObject.prior_experience = priorExperience;
    
    // Only update if there are changes to make
    if (Object.keys(updateObject).length > 0) {
      const { data, error } = await supabaseClient
        .from('projects')
        .update(updateObject)
        .eq('id', projectId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating project:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // If no updates, just return the current project data
      const { data: currentProject, error: fetchError } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching current project:', fetchError);
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify(currentProject),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
