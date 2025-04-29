
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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
    
    // Scrape images using Puppeteer
    const imageUrls = await scrapeZillowImages(url);
    
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

async function scrapeZillowImages(url: string): Promise<string[]> {
  console.log('Launching headless browser...');
  
  // Set realistic user agent to avoid bot detection
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
    headless: true,
  });

  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set a realistic Chrome desktop user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36');
    
    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    });

    console.log('Navigating to URL:', url);
    
    // Define retry logic
    const maxRetries = 3;
    let retries = 0;
    let success = false;
    
    while (!success && retries < maxRetries) {
      try {
        // Go to URL and wait for network to be idle
        await page.goto(url, { 
          waitUntil: 'networkidle0',
          timeout: 60000 // 60 second timeout
        });
        success = true;
      } catch (error) {
        retries++;
        console.warn(`Navigation attempt ${retries} failed:`, error);
        if (retries >= maxRetries) {
          throw new Error(`Failed to load page after ${maxRetries} attempts`);
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('Page loaded, extracting images...');

    // First try to get images from the gallery modal which has full-size images
    // Click on the first image to open the gallery modal
    try {
      await page.waitForSelector('[data-testid="hdp-hero-photo"]', { timeout: 5000 });
      await page.click('[data-testid="hdp-hero-photo"]');
      console.log('Clicked on hero photo to open gallery modal');
      // Wait for the gallery modal to open
      await page.waitForSelector('[data-testid="vmw-photo"]', { timeout: 5000 });
    } catch (error) {
      console.log('Could not click on hero photo or gallery not found:', error);
      // Continue without opening gallery modal
    }

    // Extract all image URLs
    const imageUrls = await page.evaluate(() => {
      const images: string[] = [];
      const imgElements = document.querySelectorAll('img');
      
      imgElements.forEach(img => {
        let src = img.getAttribute('src') || '';
        const dataSrc = img.getAttribute('data-src') || '';
        
        // Prefer data-src if available (often higher quality)
        if (dataSrc && dataSrc.includes('photos.zillow') || dataSrc.includes('zillowstatic')) {
          src = dataSrc;
        }
        
        // Filter for Zillow property images and filter out small images
        if (src && 
            (src.includes('photos.zillow') || src.includes('zillowstatic.com')) &&
            img.width > 300 && img.height > 300) {
          
          // Clean up URL to get the highest quality version (remove size limitations)
          let cleanUrl = src;
          cleanUrl = cleanUrl.replace(/-cc_ft_\\d+/g, '');
          
          // Add to images array if not already included
          if (!images.includes(cleanUrl)) {
            images.push(cleanUrl);
          }
        }
      });
      
      // Also look for srcset attributes which often contain higher resolution images
      const pictureSourceElements = document.querySelectorAll('picture source[srcset]');
      pictureSourceElements.forEach(source => {
        const srcset = source.getAttribute('srcset');
        if (srcset && (srcset.includes('photos.zillow') || srcset.includes('zillowstatic'))) {
          // Get the highest resolution from srcset (usually the last one)
          const srcsetUrls = srcset.split(',')
            .map(src => src.trim().split(' ')[0])
            .filter(src => src.includes('photos.zillow') || src.includes('zillowstatic'));
          
          if (srcsetUrls.length > 0) {
            // Get the URL with highest resolution
            const highResUrl = srcsetUrls[srcsetUrls.length - 1];
            // Clean up URL
            const cleanUrl = highResUrl.replace(/-cc_ft_\\d+/g, '');
            
            if (!images.includes(cleanUrl)) {
              images.push(cleanUrl);
            }
          }
        }
      });
      
      return images;
    });
    
    console.log(`Found ${imageUrls.length} images`);
    
    if (imageUrls.length === 0) {
      console.warn('No images found on the page');
    } else {
      console.log('First few image URLs:', imageUrls.slice(0, 3));
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}
