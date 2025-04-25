
import { supabase } from "@/integrations/supabase/client";

interface PropertyData {
  sqft?: string;
  bedrooms?: string;
  bathrooms?: string;
  propertyType?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
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
        throw new Error(error.message || 'Failed to call property scraping service');
      }
      
      if (!data || data.error) {
        console.error('Property scraping error:', data?.error || 'Unknown error');
        return { 
          success: false, 
          error: data?.error || 'Failed to extract property data'
        };
      }
      
      console.log('Property data retrieved successfully:', data);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error scraping property:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape property data'
      };
    }
  }
}
