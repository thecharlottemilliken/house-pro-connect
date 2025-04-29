
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
          onlyMainContent: true,
          extractImages: true,
          extractMetadata: true,
          waitForSelectors: [
            ".media-stream-container", // For Zillow images
            ".Summary__ImagesWrapper", // For Realtor images
            ".media-column-container"  // Alternative Zillow image container
          ]
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
    console.log('Firecrawl response received');
    
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
  console.log('Extracting data from Zillow URL');
  
  // Extract images from crawled content
  const images: string[] = [];
  
  // Try to extract images from the response
  if (crawledData.images && crawledData.images.length > 0) {
    crawledData.images.forEach((img: any) => {
      if (img.src && img.src.startsWith('http') && 
          (img.src.includes('images-')) || img.src.includes('photos')) {
        // Filter out small icons and logos
        if (img.width > 200 && img.height > 200) {
          images.push(img.src);
        }
      }
    });
  }
  
  // Try to extract address from content
  let street, city, state, zipCode;
  
  // Extract from URL structure
  const addressMatch = originalUrl.match(/\/homedetails\/([^/]+)/i);
  if (addressMatch) {
    const urlAddress = addressMatch[1].replace(/-/g, ' ');
    
    // Try to parse out components from URL
    const cityStateMatch = urlAddress.match(/([^,]+),\s*([^-]+)-([^-]+)/);
    if (cityStateMatch) {
      street = urlAddress.split(',')[0];
      city = cityStateMatch[1];
      state = cityStateMatch[2]?.trim();
      zipCode = cityStateMatch[3]?.trim();
    } else {
      street = urlAddress;
    }
  }
  
  // Try to find address in metadata or text content
  if (crawledData.metadata) {
    // Look for address in meta tags
    if (crawledData.metadata.title) {
      const titleMatch = crawledData.metadata.title.match(/([^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})/);
      if (titleMatch) {
        street = street || titleMatch[1].trim();
        city = city || titleMatch[2].trim();
        state = state || titleMatch[3].trim();
        zipCode = zipCode || titleMatch[4].trim();
      }
    }
    
    // Look for og:title which sometimes contains the address
    if (crawledData.metadata['og:title']) {
      const ogTitleMatch = crawledData.metadata['og:title'].match(/([^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})/);
      if (ogTitleMatch) {
        street = street || ogTitleMatch[1].trim();
        city = city || ogTitleMatch[2].trim();
        state = state || ogTitleMatch[3].trim();
        zipCode = zipCode || ogTitleMatch[4].trim();
      }
    }
  }
  
  // Extract bedrooms, bathrooms and sqft from text content
  let bedrooms, bathrooms, sqft, propertyType;
  
  // Look for common patterns in the content
  if (crawledData.text) {
    const bedroomsMatch = crawledData.text.match(/(\d+)\s*(bed|bedroom)/i);
    if (bedroomsMatch) {
      bedrooms = bedroomsMatch[1];
    }
    
    const bathroomsMatch = crawledData.text.match(/(\d+\.?\d*)\s*(bath|bathroom)/i);
    if (bathroomsMatch) {
      bathrooms = bathroomsMatch[1];
    }
    
    const sqftMatch = crawledData.text.match(/(\d+,?\d*)\s*sq\s*ft/i);
    if (sqftMatch) {
      sqft = sqftMatch[1].replace(',', '');
    }
    
    // Try to determine property type
    if (crawledData.text.includes('Single Family')) {
      propertyType = 'Single Family';
    } else if (crawledData.text.includes('Condo')) {
      propertyType = 'Condo';
    } else if (crawledData.text.includes('Townhouse')) {
      propertyType = 'Townhouse';
    } else if (crawledData.text.includes('Multi-Family')) {
      propertyType = 'Multi-Family';
    }
  }
  
  return {
    address: {
      street: street || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined
    },
    bedrooms: bedrooms || undefined,
    bathrooms: bathrooms || undefined,
    sqft: sqft || undefined,
    propertyType: propertyType || 'Single Family',
    images: images.length > 0 ? images : undefined
  };
}

function extractRealtorData(crawledData: any, originalUrl: string) {
  console.log('Extracting data from Realtor.com URL');
  
  // Extract images from crawled content
  const images: string[] = [];
  
  // Try to extract images from the response
  if (crawledData.images && crawledData.images.length > 0) {
    crawledData.images.forEach((img: any) => {
      if (img.src && img.src.startsWith('http') && 
          (img.src.includes('mls-') || img.src.includes('photos'))) {
        // Filter out small icons and logos
        if (img.width > 200 && img.height > 200) {
          images.push(img.src);
        }
      }
    });
  }
  
  // Try to extract address from content
  let street, city, state, zipCode;
  
  // Extract from URL structure
  const addressMatch = originalUrl.match(/\/property\/([^/]+)/i);
  if (addressMatch) {
    const urlAddress = addressMatch[1].replace(/-/g, ' ');
    
    // Try to parse out address components from URL
    const cityStateMatch = urlAddress.match(/([^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})/);
    if (cityStateMatch) {
      street = cityStateMatch[1].trim();
      city = cityStateMatch[2]?.trim();
      state = cityStateMatch[3]?.trim();
      zipCode = cityStateMatch[4]?.trim();
    } else {
      // If we can't parse, store the whole string as street
      street = urlAddress;
    }
  }
  
  // Try to find address in metadata or text content
  if (crawledData.metadata) {
    // Look for address in meta description
    if (crawledData.metadata.description) {
      const descMatch = crawledData.metadata.description.match(/([^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})/);
      if (descMatch) {
        street = street || descMatch[1].trim();
        city = city || descMatch[2].trim();
        state = state || descMatch[3].trim();
        zipCode = zipCode || descMatch[4].trim();
      }
    }
    
    // Look for og:title which sometimes contains the address
    if (crawledData.metadata['og:title']) {
      const ogTitleMatch = crawledData.metadata['og:title'].match(/([^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})/);
      if (ogTitleMatch) {
        street = street || ogTitleMatch[1].trim();
        city = city || ogTitleMatch[2].trim();
        state = state || ogTitleMatch[3].trim();
        zipCode = zipCode || ogTitleMatch[4].trim();
      }
    }
  }
  
  // Extract bedrooms, bathrooms and sqft from text content
  let bedrooms, bathrooms, sqft, propertyType;
  
  // Look for common patterns in the content
  if (crawledData.text) {
    const bedroomsMatch = crawledData.text.match(/(\d+)\s*(bed|bedroom)/i);
    if (bedroomsMatch) {
      bedrooms = bedroomsMatch[1];
    }
    
    const bathroomsMatch = crawledData.text.match(/(\d+\.?\d*)\s*(bath|bathroom)/i);
    if (bathroomsMatch) {
      bathrooms = bathroomsMatch[1];
    }
    
    const sqftMatch = crawledData.text.match(/(\d+,?\d*)\s*sq\s*ft/i);
    if (sqftMatch) {
      sqft = sqftMatch[1].replace(',', '');
    }
    
    // Try to determine property type
    if (crawledData.text.includes('Single Family')) {
      propertyType = 'Single Family';
    } else if (crawledData.text.includes('Condo')) {
      propertyType = 'Condo';
    } else if (crawledData.text.includes('Townhouse')) {
      propertyType = 'Townhouse';
    } else if (crawledData.text.includes('Multi-Family')) {
      propertyType = 'Multi-Family';
    }
  }
  
  return {
    address: {
      street: street || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined
    },
    bedrooms: bedrooms || undefined,
    bathrooms: bathrooms || undefined,
    sqft: sqft || undefined,
    propertyType: propertyType || 'Single Family',
    images: images.length > 0 ? images : undefined
  };
}

function extractGenericData(crawledData: any, originalUrl: string) {
  console.log('Extracting data using generic method');
  
  // Try to extract images from the response
  const images: string[] = [];
  if (crawledData.images && crawledData.images.length > 0) {
    crawledData.images.forEach((img: any) => {
      // Only include reasonably sized images (skip icons, etc.)
      if (img.src && img.src.startsWith('http') && 
          img.width > 200 && img.height > 200) {
        images.push(img.src);
      }
    });
  }
  
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
    propertyType: undefined,
    images: images.length > 0 ? images : undefined
  };
}
