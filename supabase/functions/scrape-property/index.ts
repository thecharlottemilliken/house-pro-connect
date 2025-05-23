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
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    
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

    if (!openAiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OpenAI API key not configured' 
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
    
    // Enhanced options for better image extraction from property galleries
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: url,
        pageOptions: {
          onlyMainContent: false, // Changed to false to capture the whole page
          extractImages: true,
          imageQuality: 'high',
          extractMetadata: true,
          waitForSelectors: [
            // Zillow specific selectors for image galleries
            "ul.hollywood-vertical-media-wall-container", // Main gallery container
            "[data-testid='vmw-photo']", // Individual photo elements
            "picture source[srcset]", // Image sources with srcset
            "picture img", // Actual image elements
            
            // More general gallery selectors for real estate sites
            ".media-stream-container", 
            ".Summary__ImagesWrapper",
            ".media-column-container",
            ".photo-tile",
            "[data-testid='hdp-hero-photo']",
            "[data-testid='property-image-gallery']",
            ".swiper-slide",
            ".carousel"
          ],
          waitUntil: "networkidle",
          fullPage: true // Get the full page to ensure we capture hidden galleries
        },
        customJS: `
          // Custom JS to extract high-quality image URLs from Zillow's gallery
          function extractZillowImages() {
            const images = [];
            
            // Try to extract from picture elements in the gallery
            const pictureElements = document.querySelectorAll('picture img');
            pictureElements.forEach(img => {
              if (img.src && img.src.includes('photos.zillow')) {
                // Get the highest quality version by removing size limitations
                let highQualitySrc = img.src;
                highQualitySrc = highQualitySrc.replace(/-cc_ft_\\d+/g, '');
                
                if (!images.includes(highQualitySrc)) {
                  images.push(highQualitySrc);
                }
              }
            });
            
            // Try to get source elements with srcset for highest quality
            const sourceSets = document.querySelectorAll('picture source[srcset]');
            sourceSets.forEach(source => {
              if (source.srcset) {
                // Get the highest resolution from srcset
                const srcsetUrls = source.srcset.split(',')
                  .map(src => src.trim().split(' ')[0])
                  .filter(src => src.includes('photos.zillow'));
                
                // Get the last one which is usually highest resolution
                if (srcsetUrls.length > 0) {
                  const highestRes = srcsetUrls[srcsetUrls.length - 1];
                  // Remove size limitations
                  const cleanUrl = highestRes.replace(/-cc_ft_\\d+/g, '');
                  
                  if (!images.includes(cleanUrl)) {
                    images.push(cleanUrl);
                  }
                }
              }
            });
            
            return images;
          }
          
          return {
            zillowGalleryImages: extractZillowImages()
          };
        `
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
    
    // Extract gallery images from custom JS results
    let galleryImages = [];
    if (crawledData.customJSResult && crawledData.customJSResult.zillowGalleryImages) {
      galleryImages = crawledData.customJSResult.zillowGalleryImages;
      console.log(`Found ${galleryImages.length} images from Zillow gallery using custom JS:`, galleryImages);
    }
    
    // Extract basic property data from crawled content
    const basicPropertyData = parsePropertyData(crawledData, url, galleryImages);
    
    if (!basicPropertyData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Could not extract property data from provided URL' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Send crawled content to OpenAI for enhanced extraction
    const enhancedPropertyData = await enhanceWithOpenAI(crawledData, basicPropertyData, url, openAiApiKey);
    
    // Make sure we keep the images from gallery extraction
    if (basicPropertyData.images && basicPropertyData.images.length > 0) {
      enhancedPropertyData.images = basicPropertyData.images;
    }
    
    console.log('Successfully enhanced property data with AI:', enhancedPropertyData);
    
    return new Response(JSON.stringify({ success: true, data: enhancedPropertyData }), {
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

// Enhanced property data with OpenAI
async function enhanceWithOpenAI(crawledData: any, basicPropertyData: any, url: string, openAiApiKey: string) {
  try {
    const pageContent = crawledData.text || '';
    const metadata = crawledData.metadata || {};
    const htmlContent = crawledData.html || '';
    
    // Create a comprehensive prompt for OpenAI
    const prompt = `
You are a real estate data extraction expert. Extract structured property information from the following real estate listing.
Use the provided data to extract as much detailed property information as possible.

URL: ${url}

Page Title: ${metadata.title || ''}
Page Description: ${metadata.description || ''}

Page Content:
${pageContent.substring(0, 3000)}

Based on the above, extract the following information in a JSON format:
- address: {street, city, state, zipCode}
- bedrooms (as a number or string like "3" or "4+")
- bathrooms (as a number or string like "2", "2.5", etc.)
- sqft (square footage as a number without commas)
- propertyType (e.g., "Single Family", "Condo", "Townhouse", "Multi-Family")
- yearBuilt (if available)
- lotSize (if available)
- price (if available, as a number without currency symbols or commas)
- description (a brief description if available)
- factsAndFeatures (extract all facts and features, separated by commas)
- features (an array of property features and amenities)

Example format:
{
  "address": {
    "street": "123 Main St",
    "city": "Austin", 
    "state": "TX",
    "zipCode": "78701"
  },
  "bedrooms": "3",
  "bathrooms": "2.5",
  "sqft": "2100",
  "propertyType": "Single Family",
  "yearBuilt": "2005",
  "lotSize": "0.25",
  "price": "499000",
  "description": "Beautiful renovated home in central neighborhood",
  "factsAndFeatures": "Hardwood floors, Granite countertops, Central AC, Fenced yard, 2-car garage",
  "features": ["Hardwood floors", "Granite countertops", "Central AC", "Fenced yard", "2-car garage"]
}

Format the output as clean JSON only, without any explanations or additional text.
`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a data extraction assistant that processes real estate listing data and outputs structured JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      // Fallback to basic extracted data if OpenAI fails
      return basicPropertyData;
    }

    const openAIData = await openAIResponse.json();
    const jsonContent = openAIData.choices[0].message.content;
    
    try {
      // Try to parse the JSON response
      const parsedJson = JSON.parse(jsonContent);
      
      // Preserve the images from basic extraction
      const mergedData = {
        ...parsedJson,
        images: basicPropertyData.images
      };
      
      console.log('Enhanced property data with AI:', mergedData);
      return mergedData;
    } catch (error) {
      console.error('Failed to parse OpenAI JSON response:', error);
      console.log('Raw OpenAI response:', jsonContent);
      // Fallback to basic extracted data
      return basicPropertyData;
    }
  } catch (error) {
    console.error('Error enhancing data with OpenAI:', error);
    // Fallback to basic extraction
    return basicPropertyData;
  }
}

// Parse property data from crawled content (basic extraction)
function parsePropertyData(crawledData: any, originalUrl: string, galleryImages: string[] = []) {
  try {
    // Check if the URL is from a known real estate site
    if (originalUrl.includes('zillow.com')) {
      return extractZillowData(crawledData, originalUrl, galleryImages);
    } else if (originalUrl.includes('realtor.com')) {
      return extractRealtorData(crawledData, originalUrl, galleryImages);
    } else {
      return extractGenericData(crawledData, originalUrl, galleryImages);
    }
  } catch (error) {
    console.error('Error parsing property data:', error);
    return null;
  }
}

function extractZillowData(crawledData: any, originalUrl: string, galleryImages: string[] = []) {
  console.log('Extracting data from Zillow URL');
  
  // Extract images from crawled content
  const images: string[] = [];
  
  // First, use any gallery images obtained from custom JS
  if (galleryImages && galleryImages.length > 0) {
    console.log(`Using ${galleryImages.length} images from gallery extraction`);
    galleryImages.forEach(img => {
      if (!images.includes(img)) {
        images.push(img);
      }
    });
  }
  
  // Then try to extract images from the crawled data
  if (crawledData.images && crawledData.images.length > 0) {
    console.log(`Found ${crawledData.images.length} images in the scraped data`);
    
    // First look for highest quality Zillow property images
    const propertyImages = crawledData.images.filter((img: any) => 
      img.src && img.src.startsWith('http') &&
      (img.width > 500 && img.height > 500) &&
      (
        img.src.includes('photos.zillow') || 
        img.src.includes('photos.zillowstatic.com') ||
        img.src.includes('zillowstatic.com') ||
        img.src.includes('/hdp-') ||
        img.src.includes('pictures.zillow.com')
      )
    );
    
    if (propertyImages.length > 0) {
      console.log(`Found ${propertyImages.length} high-quality Zillow property images`);
      propertyImages.forEach((img: any) => {
        // Clean up the URL to get the highest quality version
        let imgUrl = img.src;
        
        // Remove any size limitations in the URL
        imgUrl = imgUrl.replace(/-cc_ft_\d+/g, '');
        
        if (!images.includes(imgUrl)) {
          console.log(`Adding image from crawled data: ${imgUrl}`);
          images.push(imgUrl);
        }
      });
    } else {
      // Fallback to any reasonably sized images
      crawledData.images.forEach((img: any) => {
        if (img.src && img.src.startsWith('http')) {
          // Filter out small icons and logos, focus on property images
          if (img.width > 300 && img.height > 300) {
            // Clean up the URL to get the highest quality version
            let imgUrl = img.src;
            imgUrl = imgUrl.replace(/-cc_ft_\d+/g, '');
            
            if (!images.includes(imgUrl)) {
              console.log(`Adding fallback image: ${imgUrl} (${img.width}x${img.height})`);
              images.push(imgUrl);
            }
          }
        }
      });
    }
  }

  // Special handling for Zillow JSONLD data which often contains image data
  if (crawledData.jsonLd && Array.isArray(crawledData.jsonLd)) {
    crawledData.jsonLd.forEach((item: any) => {
      if (item['@type'] === 'SingleFamilyResidence' || 
          item['@type'] === 'Product' || 
          item['@type'] === 'PropertyListing') {
        if (item.image && Array.isArray(item.image)) {
          item.image.forEach((imgUrl: string) => {
            if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
              // Clean up the URL to get the highest quality version
              let cleanUrl = imgUrl;
              cleanUrl = cleanUrl.replace(/-cc_ft_\d+/g, '');
              
              if (!images.includes(cleanUrl)) {
                console.log(`Adding image from JSON-LD: ${cleanUrl}`);
                images.push(cleanUrl);
              }
            }
          });
        } else if (item.image && typeof item.image === 'string') {
          // Clean up the URL to get the highest quality version
          let cleanUrl = item.image;
          cleanUrl = cleanUrl.replace(/-cc_ft_\d+/g, '');
          
          if (!images.includes(cleanUrl)) {
            console.log(`Adding image from JSON-LD: ${cleanUrl}`);
            images.push(cleanUrl);
          }
        }
      }
    });
  }
  
  // Check for gallery images in meta tags (Open Graph images)
  if (crawledData.metadata && crawledData.metadata['og:image']) {
    const ogImage = crawledData.metadata['og:image'];
    if (ogImage && ogImage.startsWith('http')) {
      // Clean up the URL to get the highest quality version
      let cleanUrl = ogImage;
      cleanUrl = cleanUrl.replace(/-cc_ft_\d+/g, '');
      
      if (!images.includes(cleanUrl)) {
        console.log(`Adding Open Graph image: ${cleanUrl}`);
        images.push(cleanUrl);
      }
    }
  }
  
  console.log(`Extracted ${images.length} property images from Zillow`);
  
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
  
  // Check for JSON-LD data which often contains structured property info
  if (crawledData.jsonLd && Array.isArray(crawledData.jsonLd)) {
    for (const item of crawledData.jsonLd) {
      if (item['@type'] === 'SingleFamilyResidence' || 
          item['@type'] === 'Product' || 
          item['@type'] === 'PropertyListing') {
        
        if (item.numberOfBedrooms) {
          bedrooms = bedrooms || item.numberOfBedrooms.toString();
        }
        
        if (item.numberOfBathrooms) {
          bathrooms = bathrooms || item.numberOfBathrooms.toString();
        }
        
        if (item.floorSize && item.floorSize.value) {
          sqft = sqft || item.floorSize.value.toString().replace(',', '');
        }
        
        if (item.propertyType) {
          propertyType = propertyType || item.propertyType;
        }
      }
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

function extractRealtorData(crawledData: any, originalUrl: string, galleryImages: string[] = []) {
  console.log('Extracting data from Realtor.com URL');
  
  // Extract images from crawled content
  const images: string[] = [];
  
  // First, use any gallery images obtained from custom JS
  if (galleryImages && galleryImages.length > 0) {
    console.log(`Using ${galleryImages.length} images from gallery extraction`);
    galleryImages.forEach(img => {
      if (!images.includes(img)) {
        images.push(img);
      }
    });
  }
  
  // Try to extract images from the response
  if (crawledData.images && crawledData.images.length > 0) {
    console.log(`Found ${crawledData.images.length} images in the scraped data`);
    
    // First look for high-quality Realtor.com property images
    const propertyImages = crawledData.images.filter((img: any) => 
      img.src && img.src.startsWith('http') &&
      (img.width > 500 && img.height > 500) &&
      (
        img.src.includes('realtorcdn.com') || 
        img.src.includes('mls-images') ||
        img.src.includes('rdccdn.com') ||
        img.src.includes('activerain-store.s3.amazonaws.com')
      )
    );
    
    if (propertyImages.length > 0) {
      console.log(`Found ${propertyImages.length} high-quality Realtor property images`);
      propertyImages.forEach((img: any) => {
        if (!images.includes(img.src)) {
          console.log(`Adding image from crawled data: ${img.src}`);
          images.push(img.src);
        }
      });
    } else {
      // Fallback to any reasonably sized images
      crawledData.images.forEach((img: any) => {
        if (img.src && img.src.startsWith('http')) {
          // Filter for larger, likely property images
          if (img.width > 300 && img.height > 300) {
            if (!images.includes(img.src)) {
              console.log(`Adding image: ${img.src} (${img.width}x${img.height})`);
              images.push(img.src);
            }
          }
        }
      });
    }
  }
  
  // Check for JSON-LD data which often contains image data
  if (crawledData.jsonLd && Array.isArray(crawledData.jsonLd)) {
    crawledData.jsonLd.forEach((item: any) => {
      if (item['@type'] === 'SingleFamilyResidence' || 
          item['@type'] === 'Product' || 
          item['@type'] === 'PropertyListing') {
        if (item.image && Array.isArray(item.image)) {
          item.image.forEach((imgUrl: string) => {
            if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
              if (!images.includes(imgUrl)) {
                console.log(`Adding image from JSON-LD: ${imgUrl}`);
                images.push(imgUrl);
              }
            }
          });
        } else if (item.image && typeof item.image === 'string') {
          if (!images.includes(item.image)) {
            console.log(`Adding image from JSON-LD: ${item.image}`);
            images.push(item.image);
          }
        }
      }
    });
  }
  
  // Check for gallery images in meta tags
  if (crawledData.metadata && crawledData.metadata['og:image']) {
    const ogImage = crawledData.metadata['og:image'];
    if (ogImage && ogImage.startsWith('http') && !images.includes(ogImage)) {
      console.log(`Adding Open Graph image: ${ogImage}`);
      images.push(ogImage);
    }
  }
  
  console.log(`Extracted ${images.length} property images from Realtor.com`);
  
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
  
  // Check for JSON-LD data which often contains structured property info
  if (crawledData.jsonLd && Array.isArray(crawledData.jsonLd)) {
    for (const item of crawledData.jsonLd) {
      if (item['@type'] === 'SingleFamilyResidence' || 
          item['@type'] === 'Product' || 
          item['@type'] === 'PropertyListing') {
        
        if (item.numberOfBedrooms) {
          bedrooms = bedrooms || item.numberOfBedrooms.toString();
        }
        
        if (item.numberOfBathrooms) {
          bathrooms = bathrooms || item.numberOfBathrooms.toString();
        }
        
        if (item.floorSize && item.floorSize.value) {
          sqft = sqft || item.floorSize.value.toString().replace(',', '');
        }
        
        if (item.propertyType) {
          propertyType = propertyType || item.propertyType;
        }
      }
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

function extractGenericData(crawledData: any, originalUrl: string, galleryImages: string[] = []) {
  console.log('Extracting data using generic method');
  
  // Extract images from crawled content
  const images: string[] = [];
  
  // First, use any gallery images obtained from custom JS
  if (galleryImages && galleryImages.length > 0) {
    console.log(`Using ${galleryImages.length} images from gallery extraction`);
    galleryImages.forEach(img => {
      if (!images.includes(img)) {
        images.push(img);
      }
    });
  }
  
  // Try to extract images from the response
  if (crawledData.images && crawledData.images.length > 0) {
    console.log(`Found ${crawledData.images.length} images in the scraped data`);
    
    // Filter for larger, likely property images
    const propertyImages = crawledData.images.filter((img: any) => 
      img.src && img.src.startsWith('http') && 
      (img.width > 300 && img.height > 300)
    );
    
    if (propertyImages.length > 0) {
      console.log(`Found ${propertyImages.length} potential property images`);
      propertyImages.forEach((img: any) => {
        if (!images.includes(img.src)) {
          console.log(`Adding image: ${img.src} (${img.width}x${img.height})`);
          images.push(img.src);
        }
      });
    } else {
      // Fallback to any reasonably sized images
      crawledData.images.forEach((img: any) => {
        // Only include reasonably sized images (skip icons, etc.)
        if (img.src && img.src.startsWith('http') && 
            img.width > 200 && img.height > 200 && 
            !images.includes(img.src)) {
          console.log(`Adding image: ${img.src} (${img.width}x${img.height})`);
          images.push(img.src);
        }
      });
    }
  }
  
  console.log(`Extracted ${images.length} images from generic source`);
  
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
