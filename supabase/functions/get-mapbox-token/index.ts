
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Set CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get the Mapbox token from environment variables
    const mapboxToken = Deno.env.get("MAPBOX_PUBLIC_TOKEN");

    if (!mapboxToken) {
      throw new Error("MAPBOX_PUBLIC_TOKEN is not set");
    }

    // Return the token with CORS headers
    return new Response(
      JSON.stringify({ 
        token: mapboxToken,
        success: true 
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    // Return error with CORS headers
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
