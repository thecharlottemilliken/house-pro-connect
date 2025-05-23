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
  attributes?: string[];
  secondaryAddress?: string;
  factsAndFeatures?: string;
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

  private static commonAttributes = [
    "Front Yard", "Back Yard", "Historic Home", "Waterfront", "Multi-Level",
    "Open Floor Plan", "Hardwood Floors", "Finished Basement", "High Ceilings",
    "Modern Kitchen", "Pool", "Garage", "Fireplace", "Central Air", "Deck", 
    "Patio", "Stainless Appliances", "Granite Countertops", "HVAC", "Updated",
    "Renovated", "New Construction", "Garden", "Fenced Yard", "Gourmet Kitchen"
  ];

  static async scrapePropertyUrl(url: string): Promise<{ success: boolean; data?: PropertyData; error?: string }> {
    try {
      console.log('Sending request to scrape-property function with URL:', url);
      
      let processedUrl = this.normalizeUrl(url);
      if (!processedUrl) {
        return { 
          success: false, 
          error: 'Invalid URL format. Please provide a complete property listing URL.' 
        };
      }
      
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
      
      const formattedData = this.formatPropertyData(propertyData.data, images);
      
      formattedData.attributes = this.extractHomeAttributes(propertyData.data);
      
      this.parseAddressComponents(formattedData);
      
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
  
  private static parseAddressComponents(data: PropertyData): void {
    if (!data.address || !data.address.street) return;
    
    const street = data.address.street;
    
    const aptRegex = /(.+?)(?:\s+)(#\w+|apt\.?\s+\w+|suite\s+\w+|unit\s+\w+)/i;
    const match = street.match(aptRegex);
    
    if (match) {
      console.log('Found secondary address component in street address:', match[2]);
      data.address.street = match[1].trim();
      data.secondaryAddress = match[2].trim();
    }
    
    console.log('Parsed address components:', {
      street: data.address.street,
      secondaryAddress: data.secondaryAddress || 'None'
    });
  }
  
  private static extractHomeAttributes(rawData: any): string[] {
    const attributes: string[] = [];
    
    if (rawData.description) {
      this.commonAttributes.forEach(attr => {
        if (rawData.description.toLowerCase().includes(attr.toLowerCase())) {
          if (!attributes.includes(attr)) {
            attributes.push(attr);
          }
        }
      });
    }
    
    if (rawData.factsAndFeatures) {
      console.log('Found facts and features section:', rawData.factsAndFeatures);
      
      const features = rawData.factsAndFeatures.split(/[,;•]/);
      
      features.forEach((feature: string) => {
        feature = feature.trim();
        if (feature && feature.length > 2) {
          let matched = false;
          this.commonAttributes.forEach(attr => {
            if (feature.toLowerCase().includes(attr.toLowerCase())) {
              if (!attributes.includes(attr)) {
                attributes.push(attr);
                matched = true;
              }
            }
          });
          
          if (!matched && !attributes.includes(feature) &&
              !feature.match(/^\d+$/) && !feature.match(/^(sq ft|sqft|square feet|acre|yard|bath|bed)/i)) {
            attributes.push(feature);
          }
        }
      });
    }
    
    if (rawData.features && Array.isArray(rawData.features)) {
      rawData.features.forEach((feature: string) => {
        feature = feature.trim();
        if (feature && feature.length > 2 && !attributes.includes(feature)) {
          attributes.push(feature);
        }
      });
    }
    
    console.log('Extracted home attributes:', attributes);
    return attributes;
  }
  
  private static normalizeUrl(url: string): string {
    if (!url.trim()) return '';
    
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    try {
      new URL(url);
      return url;
    } catch (error) {
      console.error('Invalid URL format:', error);
      return '';
    }
  }
  
  private static formatPropertyData(rawData: any, images: string[]): PropertyData {
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
      description: rawData.description || '',
      factsAndFeatures: rawData.factsAndFeatures || ''
    };
  }
  
  private static normalizeState(state: string): string {
    state = state.trim();
    
    if (state.length === 2) {
      return state.toUpperCase();
    }
    
    const stateKey = state.toLowerCase();
    return this.stateAbbreviations[stateKey] || state;
  }
  
  private static normalizeBedroomCount(bedrooms: string): string {
    if (!bedrooms) return '';
    
    const match = bedrooms.toString().match(/(\d+(\.\d+)?)/);
    if (!match) return '';
    
    const count = parseFloat(match[1]);
    
    if (count >= 5) return '5+';
    if (Number.isInteger(count)) return count.toString();
    return count.toString();
  }
  
  private static normalizeBathroomCount(bathrooms: string): string {
    if (!bathrooms) return '';
    
    const match = bathrooms.toString().match(/(\d+(\.\d+)?)/);
    if (!match) return '';
    
    const count = parseFloat(match[1]);
    
    if (count >= 3) return '3+';
    if (count === 1.5) return '1.5';
    if (count === 2.5) return '2.5';
    if (Number.isInteger(count)) return count.toString();
    return count.toString();
  }
  
  private static normalizeSquareFeet(sqft: string): string {
    if (!sqft) return '';
    
    return sqft.toString().replace(/[^\d]/g, '');
  }
  
  private static normalizePropertyType(propertyType: string): string {
    if (!propertyType) return '';
    
    const type = propertyType.toLowerCase();
    
    for (const [key, value] of Object.entries(this.propertyTypeMap)) {
      if (type.includes(key)) {
        return value;
      }
    }
    
    return propertyType;
  }
  
  private static logPropertyDetails(data: PropertyData): void {
    if (data.address) {
      console.log('Address data:', {
        street: data.address.street || 'Not found',
        secondaryAddress: data.secondaryAddress || 'Not found',
        city: data.address.city || 'Not found',
        state: data.address.state || 'Not found',
        zipCode: data.address.zipCode || 'Not found'
      });
    } else {
      console.log('No address data found');
    }
    
    console.log('Property specs:', {
      bedrooms: data.bedrooms || 'Not found',
      bathrooms: data.bathrooms || 'Not found',
      sqft: data.sqft || 'Not found',
      propertyType: data.propertyType || 'Not found',
      yearBuilt: data.yearBuilt || 'Not found',
      lotSize: data.lotSize || 'Not found'
    });
    
    if (data.attributes && data.attributes.length > 0) {
      console.log('Home attributes:', data.attributes);
    } else {
      console.log('No home attributes found');
    }
    
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
