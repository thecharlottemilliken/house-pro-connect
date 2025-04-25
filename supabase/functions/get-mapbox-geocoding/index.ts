
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

    console.log("Geocoding query:", query);

    // Fetch geocoding results from Mapbox
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=address&country=us`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch geocoding results");
    }

    const data = await response.json();
    
    // Ensure we have proper address data for each result
    const processedResults = data.features.map(feature => {
      // The address format can vary, so we'll try to standardize it
      // In most cases, the house number is in feature.address and street name in feature.text
      
      return {
        ...feature,
        // Make sure address field is preserved
        address: feature.address || null
      };
    });

    console.log("Processed first result:", processedResults.length > 0 ? 
      JSON.stringify(processedResults[0], null, 2).substring(0, 200) + "..." : "No results");

    // Return the geocoding results
    return new Response(
      JSON.stringify({ 
        results: processedResults,
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
    console.error("Geocoding error:", error);
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
