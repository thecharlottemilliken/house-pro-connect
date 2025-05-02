
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Set Claims Edge Function started");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Set-claims function called");
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body));
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: e.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userId = body.user_id;
    if (!userId) {
      console.error("Missing user_id in request body");
      return new Response(
        JSON.stringify({ error: 'Missing user_id in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Setting claims for user: ${userId}`);
    
    // Get the user profile to check the role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user profile', details: profileError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`User profile found with role: ${profile?.role}`);
    
    // If the user is a coach, set the app_role claim
    if (profile?.role === 'coach') {
      console.log('Setting coach claim');
      
      try {
        const { data, error: claimError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { 
            app_metadata: { app_role: 'coach' },
          }
        );

        if (claimError) {
          console.error('Error setting claim:', claimError);
          return new Response(
            JSON.stringify({ error: 'Error setting claim', details: claimError }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        console.log('Coach claim set successfully:', data);
        
        return new Response(
          JSON.stringify({ success: true, role: 'coach' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (updateError) {
        console.error('Error in updateUserById:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error updating user metadata', details: updateError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      console.log('User is not a coach, no claim to set');
      return new Response(
        JSON.stringify({ success: true, role: profile?.role }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
