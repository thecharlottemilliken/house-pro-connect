
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

    // Parse the request body to get the search query
    const { query } = await req.json();

    if (!query) {
      throw new Error("No search query provided");
    }

    // Fetch geocoding results from Mapbox
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=address&country=us`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch geocoding results");
    }

    const data = await response.json();

    // Return the geocoding results
    return new Response(
      JSON.stringify({ 
        results: data.features,
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
