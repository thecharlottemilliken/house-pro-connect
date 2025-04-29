
import { supabase } from "@/integrations/supabase/client";

interface AddressInfo {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface PropertyData {
  sqft?: string;
  bedrooms?: string;
  bathrooms?: string;
  propertyType?: string;
  address?: AddressInfo;
  images?: string[];
  yearBuilt?: string;
  lotSize?: string;
  price?: string;
  description?: string;
}

export class FirecrawlService {
  static async scrapePropertyUrl(url: string): Promise<{ success: boolean; data?: PropertyData; error?: string }> {
    try {
      console.log('Sending request to scrape-property function with URL:', url);
      
      // First try to scrape property data using Firecrawl
      const { data: propertyData, error: propertyError } = await supabase.functions.invoke('scrape-property', {
        body: { url }
      });

      if (propertyError) {
        console.error('Supabase property function error:', propertyError);
        return { 
          success: false, 
          error: propertyError.message || 'Failed to call property scraping service'
        };
      }
      
      if (!propertyData || !propertyData.success) {
        console.error('Property scraping error:', propertyData?.error || 'Unknown error');
        return { 
          success: false, 
          error: propertyData?.error || 'Failed to extract property data'
        };
      }
      
      console.log('Property data retrieved successfully:', propertyData);
      
      // Now, use our dedicated function to extract high-quality images
      let images = propertyData.data.images || [];
      let imageError = null;
      
      try {
        console.log('Using dedicated image scraper for URL:', url);
        
        const { data: imageData, error: imageError } = await supabase.functions.invoke('scrape-zillow-images', {
          body: { url }
        });
        
        if (!imageError && imageData?.success && imageData?.data?.image_urls?.length > 0) {
          console.log(`Found ${imageData.data.image_urls.length} images using dedicated scraper`);
          images = imageData.data.image_urls;
        } else {
          console.warn(
            'No additional images found using dedicated scraper, or error occurred:', 
            imageError || imageData?.error || 'No image data returned'
          );
        }
      } catch (err) {
        console.error('Error using dedicated image scraper:', err);
        imageError = err instanceof Error ? err.message : 'Unknown error scraping images';
      }
      
      // Format the response data
      const formattedData: PropertyData = {
        address: {
          street: propertyData.data.address?.street,
          city: propertyData.data.address?.city,
          state: propertyData.data.address?.state,
          zipCode: propertyData.data.address?.zipCode
        },
        bedrooms: propertyData.data.bedrooms,
        bathrooms: propertyData.data.bathrooms,
        sqft: propertyData.data.sqft,
        propertyType: propertyData.data.propertyType,
        images: images,
        yearBuilt: propertyData.data.yearBuilt,
        lotSize: propertyData.data.lotSize,
        price: propertyData.data.price,
        description: propertyData.data.description
      };
      
      if (formattedData.images && formattedData.images.length > 0) {
        console.log(`Total of ${formattedData.images.length} property image URLs found:`, formattedData.images);
      } else {
        console.log('No property image URLs were found');
        
        // If we have an image error but the property data is good, we can still return success
        if (imageError) {
          console.warn('Image scraping failed but property data was retrieved:', imageError);
        }
      }
      
      return { success: true, data: formattedData };
    } catch (error) {
      console.error('Error scraping property:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape property data'
      };
    }
  }
}
