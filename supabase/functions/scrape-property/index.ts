
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
      throw new Error('Firecrawl API key not configured');
    }

    const { url } = await req.json();
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Processing property URL:', url);
    
    // Let's improve error handling with the API request
    try {
      const response = await fetch('https://api.firecrawl.dev/api/v1/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          url: url,
          limit: 1,
          scrapeOptions: {
            formats: ['markdown', 'html']
          }
        })
      });

      // Check if the response is valid JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Invalid API response format, expected JSON but got:', contentType);
        console.error('Response text preview:', textResponse.substring(0, 200));
        throw new Error(`API returned invalid format: ${contentType || 'unknown'}`);
      }

      const result = await response.json();
      
      if (!response.ok) {
        console.error('API error response:', result);
        throw new Error(`Firecrawl API error: ${result.message || result.error || 'Unknown error'}`);
      }

      // Check if we have the expected data structure
      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        console.warn('No content was returned from the API');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No property data was found. The URL may not be supported or contain property details.' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Extract and normalize property data from the scraped content
      const content = result.data[0]?.content || '';
      
      if (!content) {
        console.warn('Content was empty in the API response');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No content found in the property data' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Basic data extraction - this can be enhanced based on actual site structures
      const data = {
        sqft: extractSqft(content),
        bedrooms: extractBedrooms(content),
        bathrooms: extractBathrooms(content),
        propertyType: extractPropertyType(content),
        address: extractAddress(content)
      };

      console.log('Extracted property data:', data);

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError) {
      console.error('Error from Firecrawl API:', apiError);
      throw new Error(`API error: ${apiError.message}`);
    }
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

// Helper functions to extract data from scraped content
function extractSqft(content: string): string | undefined {
  const sqftMatch = content.match(/(\d{1,3}(?:,\d{3})*)\s*sq\s*ft/i);
  return sqftMatch ? sqftMatch[1] : undefined;
}

function extractBedrooms(content: string): string | undefined {
  const bedroomMatch = content.match(/(\d+)\s*bed/i);
  return bedroomMatch ? bedroomMatch[1] : undefined;
}

function extractBathrooms(content: string): string | undefined {
  const bathroomMatch = content.match(/(\d+(?:\.\d+)?)\s*bath/i);
  return bathroomMatch ? bathroomMatch[1] : undefined;
}

function extractPropertyType(content: string): string | undefined {
  const types = ['Single Family', 'Townhouse', 'Condo', 'Multi-Family'];
  for (const type of types) {
    if (content.toLowerCase().includes(type.toLowerCase())) {
      return type;
    }
  }
  return undefined;
}

function extractAddress(content: string): { street?: string; city?: string; state?: string; zipCode?: string } {
  // This is a basic implementation - can be enhanced based on actual content structure
  const addressMatch = content.match(/(\d+[^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})/i);
  if (addressMatch) {
    return {
      street: addressMatch[1].trim(),
      city: addressMatch[2].trim(),
      state: addressMatch[3].trim(),
      zipCode: addressMatch[4],
    };
  }
  return {};
}
