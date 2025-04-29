
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { url, propertyId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting to scrape Zillow images from URL:', url);
    
    // Extract property ID from URL if not explicitly provided
    const extractedPropertyId = propertyId || extractPropertyIdFromUrl(url);
    
    console.log('Property ID:', extractedPropertyId);
    
    // Use client-side JavaScript execution to extract images instead of Puppeteer
    // This approach doesn't require browser automation in the Edge Function
    const imageUrls = await extractZillowImagesFromUrl(url);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          property_id: extractedPropertyId,
          image_urls: imageUrls,
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in scrape-zillow-images function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape Zillow images' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractPropertyIdFromUrl(url: string): string {
  // Extract property ID from Zillow URL (e.g., /homedetails/address/12345_zpid/)
  const match = url.match(/_zpid/);
  if (match) {
    const parts = url.split('_zpid');
    const idPart = parts[0].split('/').pop();
    return idPart || 'unknown';
  }
  return 'unknown';
}

async function extractZillowImagesFromUrl(url: string): Promise<string[]> {
  console.log('Fetching Zillow page content...');
  
  try {
    // Fetch the Zillow page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Zillow page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Retrieved ${html.length} bytes of HTML content`);
    
    // Extract image URLs using regex patterns
    const imageUrls = extractImageUrlsFromHtml(html);
    
    if (imageUrls.length === 0) {
      console.warn('No images found in the HTML content');
      
      // Try to extract from JSON data that might be embedded in the page
      const jsonImageUrls = extractImageUrlsFromJsonData(html);
      if (jsonImageUrls.length > 0) {
        return jsonImageUrls;
      }
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error fetching Zillow page:', error);
    return [];
  }
}

function extractImageUrlsFromHtml(html: string): string[] {
  const imageUrls: string[] = [];
  
  // Pattern to match <img> tags with src or data-src attributes
  const imgTagPattern = /<img[^>]+(?:src|data-src)=["']([^"']+?)["'][^>]*>/gi;
  let match;
  
  while ((match = imgTagPattern.exec(html)) !== null) {
    const url = match[1];
    if (isValidZillowImageUrl(url)) {
      const cleanUrl = cleanZillowImageUrl(url);
      if (!imageUrls.includes(cleanUrl)) {
        imageUrls.push(cleanUrl);
      }
    }
  }

  // Also look for URLs in srcset attributes
  const srcsetPattern = /srcset=["']([^"']+?)["']/gi;
  while ((match = srcsetPattern.exec(html)) !== null) {
    const srcset = match[1];
    const urls = srcset.split(',')
      .map(part => part.trim().split(' ')[0])
      .filter(url => isValidZillowImageUrl(url));
      
    urls.forEach(url => {
      const cleanUrl = cleanZillowImageUrl(url);
      if (!imageUrls.includes(cleanUrl)) {
        imageUrls.push(cleanUrl);
      }
    });
  }
  
  console.log(`Found ${imageUrls.length} images using HTML parsing`);
  return imageUrls;
}

function extractImageUrlsFromJsonData(html: string): string[] {
  const imageUrls: string[] = [];
  
  // Look for JSON data in the page that might contain image URLs
  // Common pattern for embedded JSON data in Zillow pages
  const jsonPattern = /(?:"fullSizePhotos"\s*:\s*\[)(.+?)(?:\])/s;
  const match = html.match(jsonPattern);
  
  if (match && match[1]) {
    // Try to extract URLs from the JSON string
    const urlPattern = /(?:"url"\s*:\s*")(.+?)(?:")/g;
    let urlMatch;
    
    while ((urlMatch = urlPattern.exec(match[1])) !== null) {
      const url = urlMatch[1];
      if (isValidZillowImageUrl(url)) {
        const cleanUrl = cleanZillowImageUrl(url);
        if (!imageUrls.includes(cleanUrl)) {
          imageUrls.push(cleanUrl);
        }
      }
    }
  }
  
  // Try alternative pattern for Zillow's newer format
  const altJsonPattern = /(?:"images"\s*:\s*\[)(.+?)(?:\])/s;
  const altMatch = html.match(altJsonPattern);
  
  if (altMatch && altMatch[1]) {
    const urls = altMatch[1].split(',')
      .map(part => part.trim().replace(/"/g, ''))
      .filter(url => isValidZillowImageUrl(url));
      
    urls.forEach(url => {
      const cleanUrl = cleanZillowImageUrl(url);
      if (!imageUrls.includes(cleanUrl)) {
        imageUrls.push(cleanUrl);
      }
    });
  }
  
  console.log(`Found ${imageUrls.length} images in embedded JSON data`);
  return imageUrls;
}

function isValidZillowImageUrl(url: string): boolean {
  // Check if it's a Zillow image URL
  if (!url) return false;
  
  // Include various Zillow image domains
  return (
    url.includes('photos.zillowstatic.com') || 
    url.includes('photos.zillow.com') || 
    url.includes('zillowstatic.com') ||
    url.includes('zillow.com/fp/')
  ) && !url.includes('logo') && !url.includes('icon');
}

function cleanZillowImageUrl(url: string): string {
  // Make sure URL has proper protocol
  let cleanUrl = url;
  if (cleanUrl.startsWith('//')) {
    cleanUrl = 'https:' + cleanUrl;
  } else if (!cleanUrl.startsWith('http')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  // Remove size limitations for better quality
  cleanUrl = cleanUrl.replace(/-cc_ft_\d+/g, '');
  
  return cleanUrl;
}
