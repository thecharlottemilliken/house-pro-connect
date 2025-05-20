
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Types for the BeforePhotos functionality
export interface BeforePhoto {
  url: string;
  id?: string;
  createdAt?: string;
}

export interface BeforePhotosMap {
  [key: string]: BeforePhoto[];
}

/**
 * Filter and process photo URLs to ensure they're valid for storage
 * @param urls Array of URLs to be filtered
 * @returns Array of valid permanent URLs
 */
export const filterValidPhotoUrls = (urls: string[] | undefined): string[] => {
  if (!urls || !Array.isArray(urls)) return [];
  
  // Filter out invalid URLs (null, undefined, empty strings) and blob URLs
  return urls.filter(url => 
    url && 
    typeof url === 'string' && 
    url.trim() !== '' && 
    !url.startsWith('blob:')
  );
};

/**
 * Update designPreferences with new before photos for a specific area
 * @param area The room/area name
 * @param photos New photos to add
 * @param designPreferences Current design preferences object
 * @returns Updated design preferences object with new photos added
 */
export const addBeforePhotosToPreferences = (
  area: string,
  photos: string[],
  designPreferences: any = {}
): any => {
  if (!photos || photos.length === 0) return designPreferences;
  
  // Filter out any invalid photo URLs
  const validPhotos = filterValidPhotoUrls(photos);
  if (validPhotos.length === 0) return designPreferences;
  
  // Create a deep copy to prevent mutations
  const updatedPrefs = JSON.parse(JSON.stringify(designPreferences || {}));
  
  // Initialize beforePhotos structure if it doesn't exist
  if (!updatedPrefs.beforePhotos) {
    updatedPrefs.beforePhotos = {};
  }
  
  // Initialize the array for this area if it doesn't exist
  if (!updatedPrefs.beforePhotos[area] || !Array.isArray(updatedPrefs.beforePhotos[area])) {
    updatedPrefs.beforePhotos[area] = [];
  }
  
  // Get current valid photos and append new ones
  const currentValidPhotos = filterValidPhotoUrls(updatedPrefs.beforePhotos[area]);
  
  // Combine photos and remove duplicates
  updatedPrefs.beforePhotos[area] = [...new Set([...currentValidPhotos, ...validPhotos])];
  
  console.log(`BeforePhotosService: Updated area ${area} with ${validPhotos.length} new photos`);
  return updatedPrefs;
};

/**
 * Remove a photo from the beforePhotos collection for a specific area
 * @param area The room/area name
 * @param index Index of the photo to remove
 * @param designPreferences Current design preferences object
 * @returns Updated design preferences object with the photo removed
 */
export const removeBeforePhoto = (
  area: string,
  index: number,
  designPreferences: any = {}
): any => {
  if (!designPreferences?.beforePhotos?.[area] || 
      !Array.isArray(designPreferences.beforePhotos[area]) || 
      index < 0 || 
      index >= designPreferences.beforePhotos[area].length) {
    return designPreferences;
  }
  
  // Create a deep copy to prevent mutations
  const updatedPrefs = JSON.parse(JSON.stringify(designPreferences));
  
  // Remove the photo at the specified index
  updatedPrefs.beforePhotos[area].splice(index, 1);
  
  return updatedPrefs;
};

/**
 * Reorder photos within the beforePhotos collection for a specific area
 * @param area The room/area name
 * @param fromIndex Current index of the photo
 * @param toIndex New index for the photo
 * @param designPreferences Current design preferences object
 * @returns Updated design preferences with reordered photos
 */
export const reorderBeforePhotos = (
  area: string,
  fromIndex: number,
  toIndex: number,
  designPreferences: any = {}
): any => {
  if (!designPreferences?.beforePhotos?.[area] || 
      !Array.isArray(designPreferences.beforePhotos[area]) || 
      fromIndex < 0 || 
      toIndex < 0 || 
      fromIndex >= designPreferences.beforePhotos[area].length || 
      toIndex >= designPreferences.beforePhotos[area].length) {
    return designPreferences;
  }
  
  // Create a deep copy to prevent mutations
  const updatedPrefs = JSON.parse(JSON.stringify(designPreferences));
  
  // Remove the item from its original position and insert at the new position
  const [movedItem] = updatedPrefs.beforePhotos[area].splice(fromIndex, 1);
  updatedPrefs.beforePhotos[area].splice(toIndex, 0, movedItem);
  
  return updatedPrefs;
};

/**
 * Get before photos for a specific area from design preferences
 * @param area The room/area name
 * @param designPreferences Design preferences object
 * @returns Array of valid photo URLs
 */
export const getBeforePhotos = (area: string, designPreferences: any): string[] => {
  if (!designPreferences?.beforePhotos?.[area]) {
    return [];
  }
  
  return filterValidPhotoUrls(designPreferences.beforePhotos[area]);
};

/**
 * Save design preferences with updated before photos to Supabase
 * @param projectId Project ID 
 * @param designPreferences Updated design preferences
 * @returns Promise that resolves with update success status
 */
export const saveBeforePhotos = async (
  projectId: string,
  designPreferences: any
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ design_preferences: designPreferences })
      .eq('id', projectId);
      
    if (error) {
      console.error("Error saving before photos:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to save before photos:", error);
    return false;
  }
};

/**
 * Select before photos from existing property photos
 * @param area The room/area name
 * @param photos Selected photo URLs
 * @param projectId Project ID
 * @param designPreferences Current design preferences
 * @returns Promise that resolves with updated design preferences on success
 */
export const selectBeforePhotos = async (
  area: string,
  photos: string[],
  projectId: string,
  designPreferences: any
): Promise<any | null> => {
  try {
    // Add the selected photos to the design preferences
    const updatedPrefs = addBeforePhotosToPreferences(area, photos, designPreferences);
    
    // Save to database
    const success = await saveBeforePhotos(projectId, updatedPrefs);
    
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to save selected photos",
        variant: "destructive"
      });
      return null;
    }
    
    toast({
      title: "Success",
      description: `Photos added to ${area}`
    });
    
    return updatedPrefs;
  } catch (error) {
    console.error("Error in selectBeforePhotos:", error);
    toast({
      title: "Error",
      description: "Failed to add photos",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Load property photos from multiple sources
 * @param propertyId Property ID
 * @returns Promise that resolves with array of photo URLs
 */
export const loadPropertyPhotos = async (propertyId?: string): Promise<string[]> => {
  if (!propertyId) return [];
  
  try {
    // Get property photos from the properties table
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select('home_photos')
      .eq('id', propertyId)
      .single();
    
    if (propertyError) {
      console.error("Error fetching property photos:", propertyError);
      throw propertyError;
    }
    
    let allPhotos: string[] = [];
    
    // Add property home_photos if they exist
    if (propertyData?.home_photos && Array.isArray(propertyData.home_photos)) {
      allPhotos = [...propertyData.home_photos];
    }
    
    // Also fetch photos from the property-files storage bucket
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('property-files')
      .list(`${propertyId}`, {
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (storageError) {
      console.error("Error fetching storage files:", storageError);
    } else if (storageFiles && storageFiles.length > 0) {
      // Only include image files
      const imageFiles = storageFiles.filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));
      
      // Generate public URLs for each file
      const storageUrls = imageFiles.map(file => {
        return supabase.storage.from('property-files').getPublicUrl(`${propertyId}/${file.name}`).data.publicUrl;
      });
      
      // Add to our collection
      allPhotos = [...allPhotos, ...storageUrls];
    }
    
    // Filter out invalid URLs and remove duplicates
    const validUniquePhotos = [...new Set(filterValidPhotoUrls(allPhotos))];
    
    return validUniquePhotos;
  } catch (error) {
    console.error("Error loading property photos:", error);
    return [];
  }
};
