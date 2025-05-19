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

export const useDesignActions = (projectId: string | undefined) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Save room measurements
  const handleSaveMeasurements = useCallback(async (
    area: string,
    measurements: Record<string, any>,
    designPreferences: any
  ) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to save measurements",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update the designPreferences object with the new measurements
      const updatedPrefs = { ...designPreferences };
      
      // Make sure the measurements structure exists
      if (!updatedPrefs.roomMeasurements) {
        updatedPrefs.roomMeasurements = {};
      }
      
      // Update or add the measurements for this area
      updatedPrefs.roomMeasurements[area] = measurements;
      
      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Room measurements saved successfully"
      });
      
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast({
        title: "Error",
        description: "Failed to save measurements",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);
  
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
      // Update the designPreferences object with the selected photos
      const updatedPrefs = { ...designPreferences };
      
      // Make sure the beforePhotos structure exists
      if (!updatedPrefs.beforePhotos) {
        updatedPrefs.beforePhotos = {};
      }
      
      // Add the selected photos to this area
      updatedPrefs.beforePhotos[area] = [
        ...(updatedPrefs.beforePhotos[area] || []),
        ...photos
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
    photos: FileWithPreview[],
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
      // Get urls from uploaded photos
      const photoUrls = photos
        .filter(p => p.status === 'complete' && p.url)
        .map(p => p.url) as string[];
      
      // If no valid urls, do nothing
      if (photoUrls.length === 0) {
        toast({
          title: "Warning",
          description: "No valid photos to add",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Photo URLs to be saved:", photoUrls);
      
      // Update the designPreferences object with the uploaded photos
      const updatedPrefs = { ...designPreferences };
      
      // Make sure the beforePhotos structure exists
      if (!updatedPrefs.beforePhotos) {
        updatedPrefs.beforePhotos = {};
      }
      
      // Add the uploaded photos to this area
      updatedPrefs.beforePhotos[area] = [
        ...(updatedPrefs.beforePhotos[area] || []),
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
        allImages = [...roomPrefs.inspiration_images, ...imageUrls];
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
        // Filter out any boards that already exist (by ID)
        const existingBoardIds = roomPrefs.pinterest_boards.map((b: any) => b.id);
        const newBoards = boards.filter(board => !existingBoardIds.includes(board.id));
        allBoards = [...roomPrefs.pinterest_boards, ...newBoards];
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
