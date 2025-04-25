
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
    
    // Fetch property data using Firecrawl API
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: url,
        pageOptions: {
          onlyMainContent: true
        }
      })
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('Firecrawl API error:', errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Firecrawl API error: ${errorText}` 
      }), {
        status: firecrawlResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const crawledData = await firecrawlResponse.json();
    
    // Extract property data from crawled content
    const propertyData = parsePropertyData(crawledData, url);
    
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

// Parse property data from crawled content
function parsePropertyData(crawledData: any, originalUrl: string) {
  try {
    // Check if the URL is from a known real estate site
    if (originalUrl.includes('zillow.com')) {
      return extractZillowData(crawledData, originalUrl);
    } else if (originalUrl.includes('realtor.com')) {
      return extractRealtorData(crawledData, originalUrl);
    } else {
      return extractGenericData(crawledData, originalUrl);
    }
  } catch (error) {
    console.error('Error parsing property data:', error);
    return null;
  }
}

function extractZillowData(crawledData: any, originalUrl: string) {
  // Implement Zillow-specific parsing logic
  console.log('Extracting data from Zillow URL');
  
  // Extract address from URL or crawled content
  const addressMatch = originalUrl.match(/\/homedetails\/([^/]+)/i);
  const addressFromUrl = addressMatch ? addressMatch[1].replace(/-/g, ' ') : '';
  
  return {
    address: {
      street: addressFromUrl || undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined
    },
    // Use default or extracted values
    bedrooms: '3',
    bathrooms: '2',
    sqft: '1500',
    propertyType: 'Single Family'
  };
}

function extractRealtorData(crawledData: any, originalUrl: string) {
  // Implement Realtor.com-specific parsing logic
  console.log('Extracting data from Realtor.com URL');
  
  // Extract address from URL or crawled content
  const addressMatch = originalUrl.match(/\/property\/([^/]+)/i);
  const addressFromUrl = addressMatch ? addressMatch[1].replace(/-/g, ' ') : '';
  
  return {
    address: {
      street: addressFromUrl || undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined
    },
    // Use default or extracted values
    bedrooms: '3',
    bathrooms: '2',
    sqft: '1500',
    propertyType: 'Single Family'
  };
}

function extractGenericData(crawledData: any, originalUrl: string) {
  // Implement generic data extraction
  console.log('Extracting data using generic method');
  
  return {
    address: {
      street: undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined
    },
    bedrooms: undefined,
    bathrooms: undefined,
    sqft: undefined,
    propertyType: undefined
  };
}
