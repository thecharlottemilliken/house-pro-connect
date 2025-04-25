
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { FirecrawlApp } from "https://esm.sh/@mendable/firecrawl-js@1.0.0";

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

    console.log('Scraping property URL:', url);
    
    const firecrawl = new FirecrawlApp({ apiKey });
    const response = await firecrawl.crawlUrl(url, {
      limit: 1,
      scrapeOptions: {
        formats: ['markdown', 'html'],
      }
    });

    if (!response.success) {
      throw new Error('Failed to scrape URL');
    }

    // Extract and normalize property data from the scraped content
    const content = response.data?.[0]?.content || '';
    
    // Basic data extraction - this can be enhanced based on actual site structures
    const data = {
      sqft: extractSqft(content),
      bedrooms: extractBedrooms(content),
      bathrooms: extractBathrooms(content),
      propertyType: extractPropertyType(content),
      address: extractAddress(content)
    };

    return new Response(JSON.stringify({ success: true, data }), {
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
