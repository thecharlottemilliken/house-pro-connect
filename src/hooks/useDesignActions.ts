import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileWithPreview } from '@/components/ui/file-upload';

// Helper function to convert string URLs to FileWithPreview objects
const convertUrlsToFileObjects = (urls: string[]): FileWithPreview[] => {
  return urls.map(url => ({
    id: url,
    name: url.split('/').pop() || 'file',
    size: '0',
    type: 'image/jpeg',
    url,
    progress: 100,
    tags: [],
    status: 'complete'
  }));
};

// Helper function to normalize area names for consistent key formatting
const normalizeAreaName = (area: string): string => {
  return area.toLowerCase().replace(/\s+/g, '_');
};

// Helper function to filter out invalid URLs
const filterValidUrls = (urls: string[] | undefined): string[] => {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.filter(url => url && typeof url === 'string' && !url.startsWith('blob:'));
};

export const useDesignActions = (projectId?: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Save room measurements
  const handleSaveMeasurements = async (area: string, measurements: any, designPreferences: any) => {
    if (!projectId) return null;
    
    try {
      console.log("Saving measurements for area:", area, measurements);
      
      // Ensure numeric values are actually numbers, not strings
      const normalizedMeasurements = {
        ...measurements,
        length: typeof measurements.length === 'string' ? parseFloat(measurements.length) || undefined : measurements.length,
        width: typeof measurements.width === 'string' ? parseFloat(measurements.width) || undefined : measurements.width,
        height: typeof measurements.height === 'string' ? parseFloat(measurements.height) || undefined : measurements.height,
        unit: measurements.unit || 'ft'
      };
      
      console.log("Normalized measurements:", normalizedMeasurements);
      
      // Create a standardized copy of the measurements with correct types
      const standardizedMeasurements = {
        ...normalizedMeasurements,
        unit: normalizedMeasurements.unit || 'ft'
      };
      
      // Normalize the area name for consistent key formatting
      const normalizedAreaName = normalizeAreaName(area);
      
      console.log(`Using normalized area name for roomMeasurements key: "${normalizedAreaName}"`);
      
      // Update the designPreferences object with the standardized measurements
      const updatedDesignPreferences = { 
        ...designPreferences,
        roomMeasurements: {
          ...designPreferences.roomMeasurements || {},
          [normalizedAreaName]: standardizedMeasurements // Use normalized area name for consistent key naming
        }
      };
      
      console.log("Updated design preferences:", JSON.stringify(updatedDesignPreferences, null, 2));
      console.log("roomMeasurements object:", JSON.stringify(updatedDesignPreferences.roomMeasurements, null, 2));
      
      const { data, error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences 
        })
        .eq('id', projectId);
      
      if (error) {
        console.error("Error saving measurements:", error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Room measurements saved successfully"
      });
      
      console.log("Measurements saved successfully for area:", area);
      return updatedDesignPreferences;
    } catch (error) {
      console.error("Error saving measurements:", error);
      toast({
        title: "Error",
        description: "Failed to save measurements",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Select before photos from property photos
  const handleSelectBeforePhotos = useCallback(async (
    area: string,
    photos: string[],
    designPreferences: any
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to save photos",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Filter out any invalid URLs or blob URLs
      const validPhotos = filterValidUrls(photos);
      
      if (validPhotos.length === 0) {
        toast({
          title: "Warning",
          description: "No valid photos to add",
          variant: "destructive"
        });
        return null;
      }
      
      // Update the designPreferences object with the selected photos
      const updatedPrefs = { ...designPreferences };
      
      // Make sure the beforePhotos structure exists
      if (!updatedPrefs.beforePhotos) {
        updatedPrefs.beforePhotos = {};
      }
      
      // Add the selected photos to this area
      updatedPrefs.beforePhotos[area] = [
        ...(filterValidUrls(updatedPrefs.beforePhotos[area]) || []),
        ...validPhotos
      ];
      
      // Remove duplicates
      updatedPrefs.beforePhotos[area] = [...new Set(updatedPrefs.beforePhotos[area])];
      
      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Photos added to ${area}`
      });
      
      return updatedPrefs;
      
    } catch (error) {
      console.error('Error saving before photos:', error);
      toast({
        title: "Error",
        description: "Failed to add photos",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);
  
  // Upload new before photos
  const handleUploadBeforePhotos = useCallback(async (
    area: string,
    photos: string[] | FileWithPreview[],
    designPreferences: any
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to upload photos",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Get urls from uploaded photos - handle both string[] and FileWithPreview[]
      let photoUrls: string[];
      
      if (photos.length > 0 && typeof photos[0] === 'string') {
        // If we received string[] directly, filter out invalid URLs
        photoUrls = filterValidUrls(photos as string[]);
      } else {
        // If we received FileWithPreview[], extract valid permanent URLs
        photoUrls = (photos as FileWithPreview[])
          .filter(p => p.status === 'complete' && p.url && !p.url.toString().startsWith('blob:'))
          .map(p => p.url as string);
      }
      
      // If no valid urls, do nothing
      if (photoUrls.length === 0) {
        toast({
          title: "Warning",
          description: "No valid photos to add",
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Photo URLs to be saved:", photoUrls);
      
      // Update the designPreferences object with the uploaded photos
      const updatedPrefs = { ...designPreferences };
      
      // Make sure the beforePhotos structure exists
      if (!updatedPrefs.beforePhotos) {
        updatedPrefs.beforePhotos = {};
      }
      
      // Filter existing photos to remove any blob URLs
      const existingPhotos = filterValidUrls(updatedPrefs.beforePhotos[area]);
      
      // Add the uploaded photos to this area
      updatedPrefs.beforePhotos[area] = [
        ...(existingPhotos || []),
        ...photoUrls
      ];
      
      // Remove duplicates
      updatedPrefs.beforePhotos[area] = [...new Set(updatedPrefs.beforePhotos[area])];
      
      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Photos added to ${area}`
      });
      
      return updatedPrefs;
      
    } catch (error) {
      console.error('Error uploading before photos:', error);
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);
  
  // Add project files (designs, renderings, etc)
  const handleAddProjectFiles = useCallback(async (
    area: string,
    files: string[],
    designPreferences: any
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to add files",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create sample file metadata for each URL
      const newFiles = files.map(url => {
        const filename = url.split('/').pop() || 'file';
        const extension = filename.split('.').pop()?.toLowerCase();
        
        let type = 'jpg';
        if (extension === 'pdf') type = 'pdf';
        else if (extension === 'xls' || extension === 'xlsx') type = 'xls';
        
        return {
          name: filename,
          size: '2MB', // Default size
          type,
          url,
          tags: [area], // Tag with current area by default
          roomId: area
        };
      });
      
      // Update the designPreferences object with the new files
      const updatedPrefs = { ...designPreferences };
      
      // Make sure the designAssets array exists
      if (!updatedPrefs.designAssets) {
        updatedPrefs.designAssets = [];
      }
      
      // Add the new files
      updatedPrefs.designAssets = [
        ...updatedPrefs.designAssets,
        ...newFiles
      ];
      
      console.log("Saving design assets:", updatedPrefs.designAssets);
      
      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Files added to ${area}`
      });
      
      return updatedPrefs;
      
    } catch (error) {
      console.error('Error adding project files:', error);
      toast({
        title: "Error",
        description: "Failed to add files",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);
  
  // Remove a design asset
  const handleRemoveDesignAsset = useCallback(async (
    index: number,
    designPreferences: any
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to remove asset",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update the designPreferences object by removing the file at index
      const updatedPrefs = { ...designPreferences };
      
      if (!updatedPrefs.designAssets || index >= updatedPrefs.designAssets.length) {
        throw new Error("Asset not found");
      }
      
      // Remove the asset at the specified index
      updatedPrefs.designAssets.splice(index, 1);
      
      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Asset removed successfully"
      });
      
      return updatedPrefs;
      
    } catch (error) {
      console.error('Error removing design asset:', error);
      toast({
        title: "Error",
        description: "Failed to remove asset",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);
  
  // Update asset tags - Fixed function
  const handleUpdateAssetTags = useCallback(async (
    index: number,
    tags: string[],
    designPreferences: any
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to update tags",
        variant: "destructive"
      });
      return null;
    }
    
    setIsSaving(true);
    
    try {
      console.log(`Updating tags for asset at index ${index} with tags:`, tags);
      
      // Create a deep copy of the design preferences to avoid mutations
      const updatedPrefs = JSON.parse(JSON.stringify(designPreferences));
      
      if (!updatedPrefs.designAssets || !Array.isArray(updatedPrefs.designAssets) || index >= updatedPrefs.designAssets.length) {
        throw new Error("Asset not found or designAssets is not properly initialized");
      }
      
      // Update the tags for the specified asset
      updatedPrefs.designAssets[index] = {
        ...updatedPrefs.designAssets[index],
        tags: tags
      };
      
      console.log("Updated design preferences:", updatedPrefs);
      console.log("New tags for asset:", updatedPrefs.designAssets[index].tags);
      
      // First try using direct update since we've fixed permissions
      const { data, error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedPrefs
        })
        .eq('id', projectId)
        .select();
      
      if (error) {
        console.error('Error updating project directly:', error);
        throw error;
      }
      
      console.log("Update response:", data);
      
      toast({
        title: "Success",
        description: "Tags updated successfully"
      });
      
      return updatedPrefs;
      
    } catch (error) {
      console.error('Error updating asset tags:', error);
      toast({
        title: "Error",
        description: "Failed to update tags. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);
  
  // Add Pinterest boards
  const handleAddPinterestBoards = useCallback(async (
    boards: any[],
    designPreferences: any
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to add Pinterest boards",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update the designPreferences object with the Pinterest boards
      const updatedPrefs = { ...designPreferences };
      
      // Make sure the pinterestBoards array exists
      if (!updatedPrefs.pinterestBoards) {
        updatedPrefs.pinterestBoards = [];
      }
      
      // Add the new boards
      updatedPrefs.pinterestBoards = [
        ...updatedPrefs.pinterestBoards,
        ...boards
      ];
      
      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Pinterest boards added successfully"
      });
      
      return updatedPrefs;
      
    } catch (error) {
      console.error('Error adding Pinterest boards:', error);
      toast({
        title: "Error",
        description: "Failed to add Pinterest boards",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);
  
  // Add inspiration images
  const handleAddInspirationImages = useCallback(async (
    images: FileWithPreview[] | string[],
    designPreferences: any
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to add inspiration images",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Determine if we have FileWithPreview objects or string URLs
      let imageUrls: string[] = [];
      
      if (images.length > 0 && typeof images[0] === 'string') {
        // We have an array of string URLs
        imageUrls = images as string[];
      } else {
        // We have FileWithPreview objects
        imageUrls = (images as FileWithPreview[])
          .filter(p => p.status === 'complete' && p.url)
          .map(p => p.url) as string[];
      }
      
      console.log("Inspiration image URLs to be saved:", imageUrls);
      
      // If no valid urls, do nothing
      if (imageUrls.length === 0) {
        toast({
          title: "Warning",
          description: "No valid images to add",
          variant: "destructive"
        });
        return;
      }
      
      // Update the designPreferences object with the inspiration images
      const updatedPrefs = { ...designPreferences };
      
      // Make sure the inspirationImages array exists
      if (!updatedPrefs.inspirationImages) {
        updatedPrefs.inspirationImages = [];
      }
      
      // Add the new images
      updatedPrefs.inspirationImages = [
        ...updatedPrefs.inspirationImages,
        ...imageUrls
      ];
      
      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Inspiration images added successfully"
      });
      
      return updatedPrefs;
      
    } catch (error) {
      console.error('Error adding inspiration images:', error);
      toast({
        title: "Error",
        description: "Failed to add inspiration images",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);
  
  // NEW FUNCTION: Add inspiration images to room level
  const handleAddRoomInspirationImages = useCallback(async (
    images: FileWithPreview[] | string[],
    roomId?: string
  ) => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID is required to add inspiration images",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Determine if we have FileWithPreview objects or string URLs
      let imageUrls: string[] = [];
      
      if (images.length > 0 && typeof images[0] === 'string') {
        // We have an array of string URLs
        imageUrls = images as string[];
      } else {
        // We have FileWithPreview objects
        imageUrls = (images as FileWithPreview[])
          .filter(p => p.status === 'complete' && p.url)
          .map(p => p.url) as string[];
      }
      
      console.log("Room inspiration image URLs to be saved:", imageUrls, "for room:", roomId);
      
      // If no valid urls, do nothing
      if (imageUrls.length === 0) {
        toast({
          title: "Warning",
          description: "No valid images to add",
          variant: "destructive"
        });
        return;
      }
      
      // First get the existing inspiration images for this room
      const { data: roomPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('inspiration_images')
        .eq('room_id', roomId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      // Combine existing and new images
      let allImages: string[] = [];
      if (roomPrefs && roomPrefs.inspiration_images) {
        // Fix: Ensure inspiration_images is treated as an array
        const existingImages = Array.isArray(roomPrefs.inspiration_images) 
          ? roomPrefs.inspiration_images 
          : [];
        allImages = [...existingImages, ...imageUrls];
      } else {
        allImages = imageUrls;
      }
      
      // Remove duplicates
      allImages = [...new Set(allImages)];
      
      // Update the room design preferences in Supabase
      const { error: updateError } = await supabase
        .from('room_design_preferences')
        .update({ inspiration_images: allImages })
        .eq('room_id', roomId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: "Inspiration images added to room successfully"
      });
      
      return allImages;
      
    } catch (error) {
      console.error('Error adding room inspiration images:', error);
      toast({
        title: "Error",
        description: "Failed to add inspiration images to room",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // NEW FUNCTION: Add Pinterest boards to room level
  const handleAddRoomPinterestBoards = useCallback(async (
    boards: any[],
    roomName: string,
    roomId?: string
  ) => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID is required to add Pinterest boards",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log("Adding Pinterest boards to room:", roomName, "with ID:", roomId);
      
      // First get the existing Pinterest boards for this room
      const { data: roomPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('pinterest_boards')
        .eq('room_id', roomId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      // Combine existing and new boards
      let allBoards: any[] = [];
      if (roomPrefs && roomPrefs.pinterest_boards) {
        // Fix: Ensure pinterest_boards is treated as an array
        const existingBoards = Array.isArray(roomPrefs.pinterest_boards) 
          ? roomPrefs.pinterest_boards 
          : [];
          
        // Filter out any boards that already exist (by ID)
        if (existingBoards.length > 0) {
          const existingBoardIds = existingBoards.map((b: any) => b.id);
          const newBoards = boards.filter(board => !existingBoardIds.includes(board.id));
          allBoards = [...existingBoards, ...newBoards];
        } else {
          allBoards = boards;
        }
      } else {
        allBoards = boards;
      }
      
      // Update the room design preferences in Supabase
      const { error: updateError } = await supabase
        .from('room_design_preferences')
        .update({ pinterest_boards: allBoards })
        .eq('room_id', roomId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: "Pinterest boards added to room successfully"
      });
      
      return allBoards;
      
    } catch (error) {
      console.error('Error adding Pinterest boards to room:', error);
      toast({
        title: "Error",
        description: "Failed to add Pinterest boards to room",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  return {
    isLoading,
    isSaving,
    handleSaveMeasurements,
    handleSelectBeforePhotos,
    handleUploadBeforePhotos,
    handleAddProjectFiles,
    handleRemoveDesignAsset,
    handleUpdateAssetTags,
    handleAddPinterestBoards,
    handleAddInspirationImages,
    handleAddRoomInspirationImages,
    handleAddRoomPinterestBoards
  };
};
