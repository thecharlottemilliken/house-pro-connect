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
    
    // Attempt multiple scraping strategies
    let imageUrls: string[] = [];
    
    // Strategy 1: Extract from HTML content
    imageUrls = await extractZillowImagesFromUrl(url);
    
    // Log outcome of image scraping
    if (imageUrls.length > 0) {
      console.log(`Successfully extracted ${imageUrls.length} images`);
      
      // Validate URLs by checking a sample (first image)
      if (imageUrls.length > 0) {
        try {
          console.log(`Validating first image URL: ${imageUrls[0]}`);
          const testResponse = await fetch(imageUrls[0], {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
              'Referer': 'https://www.zillow.com/',
              'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            }
          });
          
          console.log(`Test URL status: ${testResponse.status} ${testResponse.statusText}`);
          
          // If first image is invalid, log warning
          if (!testResponse.ok) {
            console.warn('Sample image URL validation failed - URLs may not be directly accessible');
          }
        } catch (err) {
          console.warn('Error validating image URL:', err);
        }
      }
    } else {
      console.warn('No images found using primary extraction method');
      
      // Strategy 2: Try alternative extraction method from JSON data
      const jsonImageUrls = await extractJsonImageUrls(url);
      if (jsonImageUrls.length > 0) {
        console.log(`Found ${jsonImageUrls.length} images from JSON data`);
        imageUrls = jsonImageUrls;
      }
    }
    
    // Final response with all found images
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
    // Enhanced headers to mimic a real browser session
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'sec-ch-ua': '"Google Chrome";v="112", "Chromium";v="112", "Not:A-Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Zillow page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Retrieved ${html.length} bytes of HTML content`);
    
    // Extract image URLs using multiple methods
    let imageUrls: string[] = [];
    
    // Method 1: Extract from img tags
    const imgTagUrls = extractImageUrlsFromHtml(html);
    if (imgTagUrls.length > 0) {
      console.log(`Found ${imgTagUrls.length} images from HTML img tags`);
      imageUrls = [...imageUrls, ...imgTagUrls];
    }
    
    // Method 2: Extract from JSON data in the page
    const jsonUrls = extractImageUrlsFromJsonData(html);
    if (jsonUrls.length > 0) {
      console.log(`Found ${jsonUrls.length} images from JSON data`);
      // Add any new URLs not already in our list
      jsonUrls.forEach(url => {
        if (!imageUrls.includes(url)) {
          imageUrls.push(url);
        }
      });
    }
    
    // Method 3: Try to find gallery data specifically
    const galleryUrls = extractGalleryImages(html);
    if (galleryUrls.length > 0) {
      console.log(`Found ${galleryUrls.length} images from gallery data`);
      // Add any new URLs not already in our list
      galleryUrls.forEach(url => {
        if (!imageUrls.includes(url)) {
          imageUrls.push(url);
        }
      });
    }
    
    console.log(`Total unique image URLs found: ${imageUrls.length}`);
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
      // Keep original URL formatting from Zillow
      if (!imageUrls.includes(url)) {
        imageUrls.push(url);
      }
    }
  }

  // Also look for URLs in srcset attributes
  const srcsetPattern = /srcset=["']([^"']+?)["']/gi;
  while ((match = srcsetPattern.exec(html)) !== null) {
    const srcset = match[1];
    const parts = srcset.split(',');
    
    // Get highest resolution image from srcset
    for (const part of parts) {
      const [url] = part.trim().split(' ');
      if (url && isValidZillowImageUrl(url)) {
        // Keep original URL without modifications
        if (!imageUrls.includes(url)) {
          imageUrls.push(url);
        }
        break; // Just take one URL from each srcset
      }
    }
  }
  
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
      if (url && !imageUrls.includes(url)) {
        imageUrls.push(url);
      }
    }
  }
  
  // Try alternative pattern for Zillow's newer format
  const altJsonPattern = /(?:"images"\s*:\s*\[)(.+?)(?:\])/s;
  const altMatch = html.match(altJsonPattern);
  
  if (altMatch && altMatch[1]) {
    const urls = altMatch[1]
      .split(',')
      .map(part => {
        // Clean up the string and remove quotes
        return part.trim().replace(/^"|"$/g, '');
      })
      .filter(url => url && url.length > 10); // Basic validation - real URLs should be longer
      
    urls.forEach(url => {
      if (!imageUrls.includes(url)) {
        imageUrls.push(url);
      }
    });
  }
  
  return imageUrls;
}

function extractGalleryImages(html: string): string[] {
  const imageUrls: string[] = [];
  
  try {
    // Look for gallery container divs
    const galleryDivPattern = /<div[^>]*class="[^"]*gallery[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const galleryMatches = html.match(galleryDivPattern);
    
    if (galleryMatches && galleryMatches.length > 0) {
      console.log(`Found ${galleryMatches.length} gallery divs`);
      
      for (const galleryDiv of galleryMatches) {
        // Extract image URLs from the gallery div
        const imgPattern = /data-src=["']([^"']+?)["']/gi;
        let imgMatch;
        
        while ((imgMatch = imgPattern.exec(galleryDiv)) !== null) {
          const url = imgMatch[1];
          if (url && !imageUrls.includes(url)) {
            imageUrls.push(url);
          }
        }
        
        // Also look for background images
        const bgPattern = /background-image:\s*url\(['"]?([^'"]+)['"]?\)/gi;
        let bgMatch;
        
        while ((bgMatch = bgPattern.exec(galleryDiv)) !== null) {
          const url = bgMatch[1];
          if (url && !imageUrls.includes(url)) {
            imageUrls.push(url);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error extracting gallery images:', error);
  }
  
  return imageUrls;
}

async function extractJsonImageUrls(url: string): Promise<string[]> {
  try {
    // Try to access Zillow's API directly if we can extract the zpid
    const zpid = extractPropertyIdFromUrl(url);
    if (zpid === 'unknown') {
      return [];
    }
    
    console.log(`Attempting to fetch image data for zpid: ${zpid}`);
    
    // This is a best-effort attempt that may be blocked by CORS
    const apiUrl = `https://www.zillow.com/graphql/?zpid=${zpid}&queryId=property%2FPropertyPhotoData`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': url,
        'Origin': 'https://www.zillow.com'
      }
    });
    
    if (!response.ok) {
      console.warn(`API request failed: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const json = await response.json();
    console.log('Received API response:', json);
    
    const imageUrls: string[] = [];
    
    // Extract image URLs from the API response
    // The exact path will depend on Zillow's API structure
    const photos = json?.data?.property?.photos;
    if (Array.isArray(photos)) {
      photos.forEach((photo: any) => {
        if (photo.url && !imageUrls.includes(photo.url)) {
          imageUrls.push(photo.url);
        }
      });
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error extracting JSON image URLs:', error);
    return [];
  }
}

function isValidZillowImageUrl(url: string): boolean {
  // Check if it's a Zillow image URL
  if (!url) return false;
  
  // Include various Zillow image domains and filter out icons/logos
  return (
    (url.includes('photos.zillowstatic.com') || 
     url.includes('photos.zillow.com') || 
     url.includes('zillowstatic.com') ||
     url.includes('zillow.com/fp/')) &&
    !url.includes('logo') && 
    !url.includes('icon') && 
    url.length > 30 // Basic validation - real image URLs should be longer
  );
}
