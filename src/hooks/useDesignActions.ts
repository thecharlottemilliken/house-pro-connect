
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { type PinterestBoard } from "@/types/pinterest";
import { DesignPreferences } from "@/hooks/useProjectData";
import { toast } from "@/hooks/use-toast";

export const useDesignActions = (projectId?: string) => {
  // Handle room measurements
  const handleSaveMeasurements = useCallback(async (area: string, measurements: any, designPreferences: DesignPreferences) => {
    try {
      if (!projectId) return;
      
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      const updatedMeasurements = {
        ...(designPreferences.roomMeasurements || {}),
        [areaKey]: measurements
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        roomMeasurements: updatedMeasurements
      };
      
      const { error } = await supabase.from('projects').update({
        design_preferences: updatedDesignPreferences as unknown as Json
      }).eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Measurements saved for ${area}`
      });
    } catch (error: any) {
      console.error('Error updating room measurements:', error);
      toast({
        title: "Error",
        description: "Failed to save measurements. Please try again.",
        variant: "destructive"
      });
    }
  }, [projectId]);

  // Handle before photos
  const handleSelectBeforePhotos = useCallback(async (area: string, selectedPhotos: string[], designPreferences: DesignPreferences) => {
    try {
      if (!projectId) return;
      
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      const updatedBeforePhotos = {
        ...(designPreferences.beforePhotos || {}),
        [areaKey]: selectedPhotos
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        beforePhotos: updatedBeforePhotos
      };
      
      const { error } = await supabase.from('projects').update({
        design_preferences: updatedDesignPreferences as unknown as Json
      }).eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Selected photos added to ${area}`
      });
    } catch (error: any) {
      console.error('Error updating before photos:', error);
      toast({
        title: "Error",
        description: "Failed to save selected photos. Please try again.",
        variant: "destructive"
      });
    }
  }, [projectId]);

  const handleUploadBeforePhotos = useCallback(async (area: string, uploadedPhotos: string[], designPreferences: DesignPreferences) => {
    try {
      if (!projectId) return;
      
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      const existingPhotos = designPreferences.beforePhotos?.[areaKey] || [];
      const updatedBeforePhotos = {
        ...(designPreferences.beforePhotos || {}),
        [areaKey]: [...existingPhotos, ...uploadedPhotos]
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        beforePhotos: updatedBeforePhotos
      };
      
      const { error } = await supabase.from('projects').update({
        design_preferences: updatedDesignPreferences as unknown as Json
      }).eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Uploaded photos added to ${area}`
      });
    } catch (error: any) {
      console.error('Error updating before photos:', error);
      toast({
        title: "Error",
        description: "Failed to save uploaded photos. Please try again.",
        variant: "destructive"
      });
    }
  }, [projectId]);

  // Handle project files
  const handleAddProjectFiles = useCallback(async (area: string, selectedFiles: string[], designPreferences: DesignPreferences) => {
    try {
      if (!projectId) return;
      
      const existingAssets = [...(designPreferences.designAssets || [])];
      
      const newAssets = selectedFiles.map(url => {
        const fileName = url.split('/').pop() || 'File';
        return {
          name: fileName,
          url: url
        };
      });
      
      const updatedAssets = [...existingAssets, ...newAssets];
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        hasDesigns: true,
        designAssets: updatedAssets
      };
      
      const { error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPreferences as unknown as Json
        })
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${newAssets.length} project file(s) added to ${area} designs`
      });
      
    } catch (error: any) {
      console.error('Error adding project files:', error);
      toast({
        title: "Error",
        description: "Failed to add project files. Please try again.",
        variant: "destructive"
      });
    }
  }, [projectId]);

  const handleRemoveDesignAsset = useCallback(async (assetIndex: number, designPreferences: DesignPreferences) => {
    try {
      if (!projectId) return;
      
      const existingAssets = [...(designPreferences.designAssets || [])];
      
      if (assetIndex >= 0 && assetIndex < existingAssets.length) {
        existingAssets.splice(assetIndex, 1);
      }
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        designAssets: existingAssets
      };
      
      const { error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPreferences as unknown as Json
        })
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Design asset removed successfully"
      });
      
    } catch (error: any) {
      console.error('Error removing design asset:', error);
      toast({
        title: "Error",
        description: "Failed to remove design asset. Please try again.",
        variant: "destructive"
      });
    }
  }, [projectId]);

  // Handle Pinterest boards and inspiration
  const handleAddPinterestBoards = useCallback(async (boards: PinterestBoard[], roomName: string, roomId?: string) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required to add Pinterest boards");
      }
      console.log(`Attempting to add ${boards.length} Pinterest boards for ${roomName}`);

      // Get existing boards from the database
      const {
        data: currentData,
        error: fetchError
      } = await supabase.from('room_design_preferences').select('pinterest_boards').eq('room_id', roomId).maybeSingle();
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing Pinterest boards:', fetchError);
        throw fetchError;
      }

      // Important: We need to merge the new boards with existing ones
      let existingBoards: PinterestBoard[] = [];
      if (currentData?.pinterest_boards) {
        existingBoards = currentData.pinterest_boards as unknown as PinterestBoard[];
        console.log(`Found ${existingBoards.length} existing Pinterest boards`);
      }

      // Create a Set of existing board IDs to avoid duplicates
      const existingBoardIds = new Set(existingBoards.map(board => board.id));
      console.log('Existing board IDs:', Array.from(existingBoardIds));

      // Only add boards that aren't already in the database
      const uniqueNewBoards = boards.filter(board => !existingBoardIds.has(board.id));
      console.log(`${uniqueNewBoards.length} new unique Pinterest boards to add`);

      // Log IDs of new boards being added
      uniqueNewBoards.forEach(board => console.log('Adding new board ID:', board.id));

      // Combine existing and new unique boards
      const combinedBoards = [...existingBoards, ...uniqueNewBoards];
      console.log(`Total of ${combinedBoards.length} Pinterest boards after merging`);

      // Convert PinterestBoard[] to a format compatible with Supabase's Json type
      const boardsForStorage = combinedBoards.map(board => ({
        id: board.id,
        name: board.name,
        url: board.url,
        imageUrl: board.imageUrl,
        pins: board.pins ? board.pins.map(pin => ({
          id: pin.id,
          imageUrl: pin.imageUrl,
          description: pin.description
        })) : undefined
      })) as unknown as Json;

      // Check if we need to create or update
      let response;
      if (!currentData) {
        console.log('Creating new room_design_preferences record');
        // Create new record if it doesn't exist
        response = await supabase.from('room_design_preferences').insert({
          room_id: roomId,
          pinterest_boards: boardsForStorage,
          inspiration_images: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        console.log('Updating existing room_design_preferences record');
        // Update existing record
        response = await supabase.from('room_design_preferences').update({
          pinterest_boards: boardsForStorage,
          updated_at: new Date().toISOString()
        }).eq('room_id', roomId);
      }
      if (response.error) {
        console.error('Error saving Pinterest boards to database:', response.error);
        throw response.error;
      }

      // Only show toast for successful additions
      if (uniqueNewBoards.length > 0) {
        toast({
          title: "Success",
          description: `Added ${uniqueNewBoards.length} new Pinterest board${uniqueNewBoards.length > 1 ? 's' : ''} for ${roomName}`
        });
      } else {
        toast({
          title: "Information",
          description: "No new Pinterest boards were added (all boards already exist)",
          variant: "default"
        });
      }
      
      return combinedBoards;
    } catch (error: any) {
      console.error('Error adding Pinterest boards:', error);
      toast({
        title: "Error",
        description: "Failed to add Pinterest boards",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const handleAddInspirationImages = useCallback(async (images: string[], roomId?: string) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required to add inspiration images");
      }
      const {
        error
      } = await supabase.from('room_design_preferences').update({
        inspiration_images: images,
        updated_at: new Date().toISOString()
      }).eq('room_id', roomId);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Added ${images.length} inspiration images`
      });
      return images;
    } catch (error: any) {
      console.error('Error adding inspiration images:', error);
      toast({
        title: "Error",
        description: "Failed to add inspiration images",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  return {
    handleSaveMeasurements,
    handleSelectBeforePhotos,
    handleUploadBeforePhotos,
    handleAddProjectFiles,
    handleRemoveDesignAsset,
    handleAddPinterestBoards,
    handleAddInspirationImages
  };
};
