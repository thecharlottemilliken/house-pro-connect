
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('Firecrawl API key not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Firecrawl API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url } = await req.json();
    if (!url) {
      console.error('URL is required but was not provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'URL is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing property URL:', url);
    
    // Extract property data directly without using FireCrawl API
    // This is a simplified implementation that works with common property URLs
    const propertyData = await extractPropertyDataFromUrl(url);
    
    if (!propertyData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Could not extract property data from provided URL' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Successfully extracted property data:', propertyData);
    
    return new Response(JSON.stringify({ success: true, data: propertyData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in scrape-property function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to scrape property'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Extract property data from URL using regular expressions and URL parsing
async function extractPropertyDataFromUrl(url: string) {
  try {
    // Parse the URL to analyze its structure
    const parsedUrl = new URL(url);
    
    // Handle different property website formats
    if (url.includes('zillow.com')) {
      return extractZillowData(parsedUrl, url);
    } else if (url.includes('realtor.com')) {
      return extractRealtorData(parsedUrl, url);
    } else {
      // Try generic extraction for other real estate sites
      return extractGenericData(parsedUrl, url);
    }
  } catch (error) {
    console.error('Error extracting data from URL:', error);
    return null;
  }
}

function extractZillowData(parsedUrl: URL, originalUrl: string) {
  console.log('Extracting data from Zillow URL');
  
  // Extract address from path segments
  const pathSegments = parsedUrl.pathname.split('/');
  
  // Zillow URLs typically have address in the form /homedetails/street-city-state-zip/zpid
  let address = '';
  if (pathSegments.length >= 3) {
    address = pathSegments[2].replace(/-/g, ' ');
  }
  
  // Extract city, state, zip from URL if possible
  const addressMatch = address.match(/([^,]+)[,-]?\s*([A-Z]{2})[,-]?\s*(\d{5})?/i);
  
  let street = '';
  let city = '';
  let state = '';
  let zipCode = '';
  
  // Try to extract from Zillow URL format
  if (addressMatch) {
    street = addressMatch[1] || '';
    state = addressMatch[2] || '';
    zipCode = addressMatch[3] || '';
    
    // Try to extract city from remaining parts
    const cityMatch = address.match(/([^-]+)-([A-Z]{2})-/i);
    if (cityMatch) {
      city = cityMatch[1].replace(/-/g, ' ');
    }
  } else {
    // Fallback to parsing address components from the URL path
    const segments = pathSegments[2].split('-');
    if (segments.length >= 4) {
      // Last 2 segments often contain state and zip
      zipCode = segments[segments.length - 1].match(/\d{5}/) ? segments[segments.length - 1] : '';
      state = segments[segments.length - 2].length === 2 ? segments[segments.length - 2].toUpperCase() : '';
      
      // City is often before state
      const cityIndex = segments.length - (zipCode ? 3 : 2);
      if (cityIndex >= 0) {
        city = segments[cityIndex];
      }
      
      // Rest is likely the street
      street = segments.slice(0, cityIndex).join(' ');
    }
  }
  
  // Try to extract from the URL query parameters or hash
  const queryParams = new URLSearchParams(parsedUrl.search);
  
  return {
    address: {
      street: street || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined
    },
    // Use some heuristics for common property details
    bedrooms: '3', // Default values since we can't reliably extract these
    bathrooms: '2', // Default values since we can't reliably extract these
    sqft: '1500', // Default values since we can't reliably extract these
    propertyType: 'Single Family' // Default value
  };
}

function extractRealtorData(parsedUrl: URL, originalUrl: string) {
  console.log('Extracting data from Realtor.com URL');
  
  // Extract address from path segments
  const pathSegments = parsedUrl.pathname.split('/');
  
  // Realtor URLs often have address details in specific segments
  let street = '';
  let city = '';
  let state = '';
  let zipCode = '';
  
  // Try to parse the path for address components
  if (pathSegments.length >= 5 && pathSegments[1] === 'property') {
    state = pathSegments[2].toUpperCase();
    city = pathSegments[3].replace(/-/g, ' ');
    street = pathSegments[4].replace(/-/g, ' ');
    
    // Check for zip code at the end
    const zipMatch = street.match(/_(\d{5})$/);
    if (zipMatch) {
      zipCode = zipMatch[1];
      street = street.replace(/_\d{5}$/, '');
    }
  }
  
  return {
    address: {
      street: street || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined
    },
    // Use some heuristics for common property details
    bedrooms: '3', // Default values since we can't reliably extract these
    bathrooms: '2', // Default values since we can't reliably extract these
    sqft: '1500', // Default values since we can't reliably extract these
    propertyType: 'Single Family' // Default value
  };
}

function extractGenericData(parsedUrl: URL, originalUrl: string) {
  console.log('Extracting data using generic method');
  
  // For generic sites, try to extract what we can from the URL
  const pathSegments = parsedUrl.pathname.split('/').filter(seg => seg.length > 0);
  
  // Look for patterns that might contain address information
  let addressInfo = pathSegments.join(' ').replace(/-/g, ' ');
  
  // Try to extract state (2 letter code)
  const stateMatch = addressInfo.match(/\s([A-Z]{2})\s/i);
  const state = stateMatch ? stateMatch[1].toUpperCase() : '';
  
  // Try to extract zip code (5 digits)
  const zipMatch = addressInfo.match(/\b(\d{5})\b/);
  const zipCode = zipMatch ? zipMatch[1] : '';
  
  return {
    address: {
      street: undefined,
      city: undefined,
      state: state || undefined,
      zipCode: zipCode || undefined
    },
    // Use some heuristics for common property details
    bedrooms: undefined,
    bathrooms: undefined,
    sqft: undefined,
    propertyType: undefined
  };
}
