
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
      
      const { data, error } = await supabase.functions.invoke('scrape-property', {
        body: { url }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to call property scraping service'
        };
      }
      
      if (!data || !data.success) {
        console.error('Property scraping error:', data?.error || 'Unknown error');
        return { 
          success: false, 
          error: data?.error || 'Failed to extract property data'
        };
      }
      
      console.log('AI-enhanced property data retrieved successfully:', data);
      
      // Check if we received image URLs
      if (data.data?.images && data.data.images.length > 0) {
        console.log(`Received ${data.data.images.length} property image URLs:`, data.data.images);
      } else {
        console.log('No property image URLs were returned from the scraper');
      }
      
      // Format the response data if needed
      const propertyData: PropertyData = {
        address: {
          street: data.data?.address?.street,
          city: data.data?.address?.city,
          state: data.data?.address?.state,
          zipCode: data.data?.address?.zipCode
        },
        bedrooms: data.data?.bedrooms,
        bathrooms: data.data?.bathrooms,
        sqft: data.data?.sqft,
        propertyType: data.data?.propertyType,
        images: data.data?.images || [],
        yearBuilt: data.data?.yearBuilt,
        lotSize: data.data?.lotSize,
        price: data.data?.price,
        description: data.data?.description
      };
      
      return { success: true, data: propertyData };
    } catch (error) {
      console.error('Error scraping property:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape property data'
      };
    }
  }
}
