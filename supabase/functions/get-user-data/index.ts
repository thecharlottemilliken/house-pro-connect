
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Get User Data Edge Function started");

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
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userIds = body.user_ids;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid user_ids in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching data for ${userIds.length} users`);
    
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

    // First try to get data from the profiles table
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);
    
    let users = [];
    
    // Create a map of profile data by user id
    const profilesMap = {};
    if (profilesData && !profilesError) {
      profilesData.forEach(profile => {
        profilesMap[profile.id] = {
          id: profile.id,
          name: profile.name,
          email: profile.email
        };
      });
    }
    
    // For any missing users, try to get from auth.users
    const missingUserIds = userIds.filter(id => !profilesMap[id]);
    
    if (missingUserIds.length > 0) {
      for (const userId of missingUserIds) {
        try {
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
          
          if (userError) {
            console.error(`Error fetching user ${userId}:`, userError);
          } else if (userData?.user) {
            profilesMap[userId] = {
              id: userData.user.id,
              email: userData.user.email,
              name: userData.user.user_metadata?.name || `User ${userData.user.id.substring(0, 6)}`,
            };
          }
        } catch (err) {
          console.error(`Error processing user ${userId}:`, err);
        }
      }
    }
    
    // Convert the map to an array
    users = Object.values(profilesMap);

    return new Response(
      JSON.stringify({ success: true, users }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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
