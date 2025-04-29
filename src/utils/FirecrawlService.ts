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
  private static stateAbbreviations: {[key: string]: string} = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY'
  };
  
  private static propertyTypeMap: {[key: string]: string} = {
    'single family': 'single-family',
    'single-family home': 'single-family',
    'house': 'single-family',
    'townhouse': 'townhouse',
    'town house': 'townhouse',
    'townhome': 'townhouse',
    'condo': 'condo',
    'condominium': 'condo',
    'multi family': 'multi-family',
    'multi-family': 'multi-family',
    'apartment': 'multi-family',
    'duplex': 'multi-family',
    'triplex': 'multi-family',
  };

  static async scrapePropertyUrl(url: string): Promise<{ success: boolean; data?: PropertyData; error?: string }> {
    try {
      console.log('Sending request to scrape-property function with URL:', url);
      
      // Validate and normalize the URL
      let processedUrl = this.normalizeUrl(url);
      if (!processedUrl) {
        return { 
          success: false, 
          error: 'Invalid URL format. Please provide a complete property listing URL.' 
        };
      }
      
      // First try to scrape property data using Firecrawl
      const { data: propertyData, error: propertyError } = await supabase.functions.invoke('scrape-property', {
        body: { url: processedUrl }
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
        console.log('Using dedicated image scraper for URL:', processedUrl);
        
        const { data: imageData, error: imageError } = await supabase.functions.invoke('scrape-zillow-images', {
          body: { url: processedUrl }
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
      
      // Format the response data with normalized values
      const formattedData = this.formatPropertyData(propertyData.data, images);
      
      // Log comprehensive data for debugging
      console.log('Final formatted property data:', formattedData);
      this.logPropertyDetails(formattedData);
      
      return { success: true, data: formattedData };
    } catch (error) {
      console.error('Error scraping property:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape property data'
      };
    }
  }
  
  private static normalizeUrl(url: string): string {
    if (!url.trim()) return '';
    
    // Add protocol if missing
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    try {
      // Validate as URL
      new URL(url);
      return url;
    } catch (error) {
      console.error('Invalid URL format:', error);
      return '';
    }
  }
  
  private static formatPropertyData(rawData: any, images: string[]): PropertyData {
    // Handle address data
    const address: AddressInfo = {
      street: rawData.address?.street || '',
      city: rawData.address?.city || '',
      state: this.normalizeState(rawData.address?.state || ''),
      zipCode: rawData.address?.zipCode || ''
    };
    
    return {
      address,
      bedrooms: this.normalizeBedroomCount(rawData.bedrooms || ''),
      bathrooms: this.normalizeBathroomCount(rawData.bathrooms || ''),
      sqft: this.normalizeSquareFeet(rawData.sqft || ''),
      propertyType: this.normalizePropertyType(rawData.propertyType || ''),
      images: images,
      yearBuilt: rawData.yearBuilt || '',
      lotSize: rawData.lotSize || '',
      price: rawData.price || '',
      description: rawData.description || ''
    };
  }
  
  private static normalizeState(state: string): string {
    state = state.trim();
    
    // If it's already a valid 2-letter code, return it uppercase
    if (state.length === 2) {
      return state.toUpperCase();
    }
    
    // Otherwise, try to convert from full name to abbreviation
    const stateKey = state.toLowerCase();
    return this.stateAbbreviations[stateKey] || state;
  }
  
  private static normalizeBedroomCount(bedrooms: string): string {
    if (!bedrooms) return '';
    
    // Extract numeric value
    const match = bedrooms.toString().match(/(\d+(\.\d+)?)/);
    if (!match) return '';
    
    const count = parseFloat(match[1]);
    
    // Format according to our application's needs
    if (count >= 5) return '5+';
    if (Number.isInteger(count)) return count.toString();
    return count.toString();
  }
  
  private static normalizeBathroomCount(bathrooms: string): string {
    if (!bathrooms) return '';
    
    // Extract numeric value
    const match = bathrooms.toString().match(/(\d+(\.\d+)?)/);
    if (!match) return '';
    
    const count = parseFloat(match[1]);
    
    // Format according to our application's needs
    if (count >= 3) return '3+';
    if (count === 1.5) return '1.5';
    if (count === 2.5) return '2.5';
    if (Number.isInteger(count)) return count.toString();
    return count.toString();
  }
  
  private static normalizeSquareFeet(sqft: string): string {
    if (!sqft) return '';
    
    // Remove all non-numeric characters
    return sqft.toString().replace(/[^\d]/g, '');
  }
  
  private static normalizePropertyType(propertyType: string): string {
    if (!propertyType) return '';
    
    const type = propertyType.toLowerCase();
    
    // Match against our standard property type names
    for (const [key, value] of Object.entries(this.propertyTypeMap)) {
      if (type.includes(key)) {
        return value;
      }
    }
    
    return propertyType;
  }
  
  private static logPropertyDetails(data: PropertyData): void {
    // Log address information
    if (data.address) {
      console.log('Address data:', {
        street: data.address.street || 'Not found',
        city: data.address.city || 'Not found',
        state: data.address.state || 'Not found',
        zipCode: data.address.zipCode || 'Not found'
      });
    } else {
      console.log('No address data found');
    }
    
    // Log property specifications
    console.log('Property specs:', {
      bedrooms: data.bedrooms || 'Not found',
      bathrooms: data.bathrooms || 'Not found',
      sqft: data.sqft || 'Not found',
      propertyType: data.propertyType || 'Not found',
      yearBuilt: data.yearBuilt || 'Not found',
      lotSize: data.lotSize || 'Not found'
    });
    
    // Log image data
    if (data.images && data.images.length > 0) {
      console.log(`Total of ${data.images.length} property image URLs found:`, 
        data.images.slice(0, 3).map(url => url.substring(0, 50) + '...'));
      if (data.images.length > 3) {
        console.log(`...and ${data.images.length - 3} more images`);
      }
    } else {
      console.log('No property image URLs were found');
    }
  }
}
