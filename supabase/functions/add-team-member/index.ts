
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
    const { projectId, userId, role, email, name } = await req.json();
    
    if (!projectId || !role || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    // Get user making the request (for added_by field)
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] || '');
    
    if (authError) {
      console.warn('Auth error:', authError);
      // Continue without added_by info
    }

    // Insert team member
    const { data, error } = await supabaseClient
      .from('project_team_members')
      .insert({
        project_id: projectId,
        user_id: userId || null,
        role: role,
        email: email,
        name: name || email.split('@')[0],
        added_by: user?.id || null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding team member:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ id: data.id }),
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
