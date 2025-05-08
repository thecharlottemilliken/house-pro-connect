
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CategorySection from "./CategorySection";
import { Json } from "@/integrations/supabase/types";

// Interface for design asset objects
interface DesignAsset {
  name: string;
  size: string;
  type: 'pdf' | 'xls' | 'jpg' | 'png';
  url?: string;
  tags?: string[];
  roomId?: string;
  id?: string;
  createdAt?: string;
}

interface DesignAssetsCardProps {
  hasRenderings: boolean;
  renderingImages?: string[];
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
  propertyBlueprint?: string | null;
  propertyId?: string;
  currentRoom: string; // Room name for tracking
  roomId?: string; // Added roomId prop
  propertyPhotos?: string[]; // Add property photos prop
}

const DesignAssetsCard = ({
  hasRenderings,
  renderingImages = [],
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
  propertyBlueprint,
  propertyId,
  currentRoom,
  roomId,
  propertyPhotos = []
}: DesignAssetsCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [blueprintFile, setBlueprintFile] = useState<DesignAsset | null>(propertyBlueprint ? {
    name: "Blueprint.pdf",
    size: "1.2MB",
    type: 'pdf',
    url: propertyBlueprint,
    tags: ['Blueprint']
  } : null);
  const [renderingFiles, setRenderingFiles] = useState<DesignAsset[]>([]);
  const [drawingFiles, setDrawingFiles] = useState<DesignAsset[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Effect to load data when component mounts or room changes
  useEffect(() => {
    if (propertyId && currentRoom) {
      console.log("Loading data for room:", currentRoom, "roomId:", roomId);
      fetchExistingData();
    }
  }, [propertyId, currentRoom, roomId]); // Add roomId as dependency

  // Function to fetch existing data from the database
  const fetchExistingData = async () => {
    try {
      await Promise.all([fetchExistingDrawings(), fetchExistingRenderings(), fetchExistingBlueprints()]);
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching existing data:', error);
      toast({
        title: "Error",
        description: "Failed to load existing design assets",
        variant: "destructive"
      });
    }
  };

  // Function to fetch existing renderings from the database
  const fetchExistingRenderings = async () => {
    if (!roomId) return;
    
    try {
      console.log("Fetching existing renderings for room:", roomId);
      const {
        data: preferences,
        error
      } = await supabase.from('room_design_preferences').select('renderings').eq('room_id', roomId).maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching renderings:', error);
        return;
      }
      if (preferences?.renderings) {
        console.log('Found existing renderings:', preferences.renderings);
        const files = (preferences.renderings as string[]).map((url: string, index: number) => {
          const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
          return {
            name: `Rendering_${index + 1}.${fileType}`,
            size: "1.5MB",
            type: fileType as 'jpg' | 'png' | 'pdf',
            url: url,
            tags: ['Rendering'],
            roomId: roomId
          };
        });
        setRenderingFiles(files);
      } else {
        // Clear renderings if none found
        setRenderingFiles([]);
      }
    } catch (error) {
      console.error('Error in fetchExistingRenderings:', error);
    }
  };

  // Function to fetch existing drawings from the database
  const fetchExistingDrawings = async () => {
    if (!roomId) return;
    
    try {
      console.log("Fetching existing drawings for room ID:", roomId);
      const {
        data: preferences,
        error
      } = await supabase.from('room_design_preferences').select('drawings').eq('room_id', roomId).maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching drawings:', error);
        return;
      }
      if (preferences?.drawings) {
        console.log('Found existing drawings:', preferences.drawings);
        const files = (preferences.drawings as string[]).map((url: string, index: number) => {
          const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
          return {
            name: `Drawing_${index + 1}.${fileType}`,
            size: "1.2MB",
            type: fileType as 'jpg' | 'png' | 'pdf',
            url: url,
            tags: ['Drawing'],
            roomId: roomId
          };
        });
        setDrawingFiles(files);
      } else {
        // Clear drawings if none found
        setDrawingFiles([]);
      }
    } catch (error) {
      console.error('Error in fetchExistingDrawings:', error);
    }
  };

  // New function to fetch existing blueprints
  const fetchExistingBlueprints = async () => {
    if (!roomId) return;
    
    try {
      console.log("Fetching existing blueprints for room ID:", roomId);
      const {
        data: preferences,
        error
      } = await supabase.from('room_design_preferences')
                        .select('design_assets')
                        .eq('room_id', roomId)
                        .maybeSingle();
                        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching blueprints:', error);
        return;
      }
      
      // Check if we have design assets and find any blueprints
      if (preferences?.design_assets && Array.isArray(preferences.design_assets)) {
        const designAssets = preferences.design_assets as any[];
        const blueprintAssets = designAssets.filter(
          (asset) => asset.tags && asset.tags.includes('Blueprint')
        );
        
        if (blueprintAssets.length > 0) {
          const blueprint = blueprintAssets[0]; // Get first blueprint
          console.log('Found existing blueprint:', blueprint);
          
          setBlueprintFile({
            name: blueprint.name || "Blueprint",
            size: blueprint.size || "1.2MB",
            type: blueprint.type || 'pdf',
            url: blueprint.url,
            tags: blueprint.tags || ['Blueprint'],
            roomId: roomId
          });
        } else {
          // If no blueprints found in design_assets, clear blueprint
          setBlueprintFile(null);
        }
      } else {
        // Clear blueprint if no design assets found
        setBlueprintFile(null);
      }
    } catch (error) {
      console.error('Error in fetchExistingBlueprints:', error);
    }
  };

  const handleUploadBlueprint = async (urls: string[]) => {
    if (!urls.length || !roomId) return;
    
    try {
      setIsUploading(true);
      
      // For room-specific blueprints, save to room_design_preferences
      const {
        data: existingPrefs,
        error: fetchError
      } = await supabase.from('room_design_preferences')
                        .select('design_assets')
                        .eq('room_id', roomId)
                        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching room design preferences:', fetchError);
        throw fetchError;
      }
      
      // Create new blueprint asset object
      const blueprintAsset: DesignAsset = {
        id: Date.now().toString(),
        name: "Blueprint.pdf",
        size: "1.2MB",
        type: 'pdf',
        url: urls[0],
        tags: ['Blueprint'],
        roomId: roomId,
        createdAt: new Date().toISOString()
      };
      
      // Update existing design assets or create new array
      const existingAssets = existingPrefs?.design_assets ? 
                            (Array.isArray(existingPrefs.design_assets) ? 
                              existingPrefs.design_assets as any[] : 
                              []) : 
                            [];
      
      // Filter out existing blueprints and add the new one
      const updatedAssets = [
        ...existingAssets.filter((asset: any) => 
          !(asset.tags && asset.tags.includes('Blueprint'))
        ),
        blueprintAsset
      ];
      
      let updateError;
      
      if (existingPrefs) {
        // Update existing record - This is where the error occurs
        const {
          error
        } = await supabase.from('room_design_preferences').update({
          design_assets: updatedAssets as Json,
          updated_at: new Date().toISOString()
        }).eq('room_id', roomId);
        updateError = error;
      } else {
        // Create new record
        const {
          error
        } = await supabase.from('room_design_preferences').insert({
          room_id: roomId,
          design_assets: [blueprintAsset] as unknown as Json,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        updateError = error;
      }
      
      if (updateError) {
        console.error('Error saving blueprint:', updateError);
        throw updateError;
      }
      
      setBlueprintFile({
        name: "Blueprint.pdf",
        size: "1.2MB",
        type: 'pdf',
        url: urls[0],
        tags: ['Blueprint'],
        roomId: roomId
      });
      
      toast({
        title: "Blueprint Added",
        description: `Your blueprint has been successfully uploaded for ${currentRoom}.`
      });
    } catch (error) {
      console.error('Error uploading blueprint:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading the blueprint.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBlueprint = async () => {
    if (!roomId) return;
    
    try {
      const {
        data: existingPrefs,
        error: fetchError
      } = await supabase.from('room_design_preferences')
                        .select('design_assets')
                        .eq('room_id', roomId)
                        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingPrefs && existingPrefs.design_assets) {
        // Filter out blueprint assets
        const designAssets = Array.isArray(existingPrefs.design_assets) ? 
                            existingPrefs.design_assets as any[] : 
                            [];
        
        const updatedAssets = designAssets.filter(
          (asset: any) => !(asset.tags && asset.tags.includes('Blueprint'))
        );
        
        const {
          error: updateError
        } = await supabase.from('room_design_preferences').update({
          design_assets: updatedAssets as Json,
          updated_at: new Date().toISOString()
        }).eq('room_id', roomId);
        
        if (updateError) throw updateError;
      }
      
      setBlueprintFile(null);
      toast({
        title: "Blueprint Removed",
        description: `The blueprint for ${currentRoom} has been successfully removed.`
      });
    } catch (error) {
      console.error('Error removing blueprint:', error);
      toast({
        title: "Remove Failed",
        description: "There was a problem removing the blueprint.",
        variant: "destructive"
      });
    }
  };

  // Keep existing rendering, drawing handling functions
  // ... keep existing code (handleAddRenderings and handleRemoveRendering functions)

  const handleAddRenderings = async (urls: string[], targetRoomId?: string) => {
    console.log("Adding rendering URLs:", urls);
    if (!urls.length) return;
    
    // Use passed roomId or fall back to class property
    const currentRoomId = targetRoomId || roomId;
    if (!currentRoomId) {
      toast({
        title: "Error",
        description: "Could not identify a room for this rendering.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Get existing room design preferences
      const {
        data: existingPrefs,
        error: fetchError
      } = await supabase.from('room_design_preferences').select('renderings').eq('room_id', currentRoomId).maybeSingle();
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching room design preferences:', fetchError);
        throw fetchError;
      }

      // Combine existing and new renderings
      const existingRenderings = existingPrefs?.renderings || [];
      const updatedRenderings = [...existingRenderings, ...urls];
      console.log("Existing renderings:", existingRenderings);
      console.log("Updated renderings:", updatedRenderings);

      // Check if record exists
      const {
        data: existingRecord,
        error: checkError
      } = await supabase.from('room_design_preferences').select('id').eq('room_id', currentRoomId).maybeSingle();
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking room design preferences:', checkError);
        throw checkError;
      }
      
      let updateError;
      if (existingRecord) {
        console.log("Updating existing record");
        // Update existing record
        const {
          error
        } = await supabase.from('room_design_preferences').update({
          renderings: updatedRenderings,
          updated_at: new Date().toISOString()
        }).eq('room_id', currentRoomId);
        updateError = error;
      } else {
        console.log("Creating new record");
        // Create new record
        const {
          error
        } = await supabase.from('room_design_preferences').insert({
          room_id: currentRoomId,
          renderings: updatedRenderings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        updateError = error;
      }
      if (updateError) {
        console.error('Error saving renderings:', updateError);
        throw updateError;
      }

      // Update local state
      const newRenderings = urls.map((url, index) => {
        const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
        return {
          name: `Rendering_${renderingFiles.length + index + 1}.${fileType}`,
          size: "1.5MB",
          type: fileType as 'jpg' | 'png' | 'pdf',
          url: url,
          tags: ['Rendering'],
          roomId: currentRoomId
        };
      });
      setRenderingFiles(prev => [...prev, ...newRenderings]);
      toast({
        title: "Success",
        description: "Renderings have been saved successfully."
      });

      // Refresh the data to ensure we have the latest
      fetchExistingRenderings();
    } catch (error) {
      console.error('Error saving renderings:', error);
      toast({
        title: "Error",
        description: "Failed to save renderings. Please try again.",
        variant: "destructive"
      });
    }
    if (onAddRenderings) onAddRenderings();
  };

  const handleRemoveRendering = async (index: number) => {
    try {
      if (renderingFiles.length === 0 || !roomId || index >= renderingFiles.length) {
        return;
      }
      
      const {
        data: existingPrefs,
        error: fetchError
      } = await supabase.from('room_design_preferences').select('renderings').eq('room_id', roomId).maybeSingle();
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      const existingRenderings = existingPrefs?.renderings || [];
      if (existingRenderings.length > 0 && index < existingRenderings.length) {
        // Remove the specific rendering at the index
        const updatedRenderings = [...existingRenderings];
        updatedRenderings.splice(index, 1);
        
        const {
          error: updateError
        } = await supabase.from('room_design_preferences').update({
          renderings: updatedRenderings,
          updated_at: new Date().toISOString()
        }).eq('room_id', roomId);
        
        if (updateError) throw updateError;
      }
      
      // Update local state
      setRenderingFiles(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      toast({
        title: "Success",
        description: "Rendering removed successfully."
      });
    } catch (error) {
      console.error('Error removing rendering:', error);
      toast({
        title: "Error",
        description: "Failed to remove rendering. Please try again.",
        variant: "destructive"
      });
    }
  };

  // ... keep existing code (handleAddDrawings and handleRemoveDrawing functions)

  const handleAddDrawings = async (urls: string[], targetRoomId?: string) => {
    console.log("Adding drawing URLs:", urls);
    if (!urls.length) return;
    
    // Use passed roomId or fall back to class property
    const currentRoomId = targetRoomId || roomId;
    if (!currentRoomId) {
      toast({
        title: "Error",
        description: "Could not identify a room for this drawing.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Using room ID for drawings:", currentRoomId);

      // Get existing room design preferences
      const {
        data: existingPrefs,
        error: fetchError
      } = await supabase.from('room_design_preferences').select('drawings').eq('room_id', currentRoomId).maybeSingle();
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching room design preferences:', fetchError);
        throw fetchError;
      }

      // Combine existing and new drawings
      const existingDrawings = existingPrefs?.drawings || [];
      const updatedDrawings = [...existingDrawings, ...urls];
      console.log("Existing drawings:", existingDrawings);
      console.log("Updated drawings:", updatedDrawings);

      // Check if record exists
      const {
        data: existingRecord,
        error: checkError
      } = await supabase.from('room_design_preferences').select('id').eq('room_id', currentRoomId).maybeSingle();
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking room design preferences:', checkError);
        throw checkError;
      }
      
      let updateError;
      if (existingRecord) {
        console.log("Updating existing record for drawings");
        // Update existing record
        const {
          error
        } = await supabase.from('room_design_preferences').update({
          drawings: updatedDrawings,
          updated_at: new Date().toISOString()
        }).eq('room_id', currentRoomId);
        updateError = error;
      } else {
        console.log("Creating new record for drawings");
        // Create new record
        const {
          error
        } = await supabase.from('room_design_preferences').insert({
          room_id: currentRoomId,
          drawings: updatedDrawings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        updateError = error;
      }
      if (updateError) {
        console.error('Error saving drawings:', updateError);
        throw updateError;
      }

      // Update local state
      const newDrawings = urls.map((url, index) => {
        const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
        return {
          name: `Drawing_${drawingFiles.length + index + 1}.${fileType}`,
          size: "1.2MB",
          type: fileType as 'jpg' | 'png' | 'pdf',
          url: url,
          tags: ['Drawing'],
          roomId: currentRoomId
        };
      });
      
      setDrawingFiles(prev => [...prev, ...newDrawings]);
      
      toast({
        title: "Success",
        description: "Drawings have been saved successfully."
      });

      // Refresh the data to ensure we have the latest
      fetchExistingDrawings();
    } catch (error) {
      console.error('Error saving drawings:', error);
      toast({
        title: "Error",
        description: "Failed to save drawings. Please try again.",
        variant: "destructive"
      });
    }
    if (onAddDrawings) onAddDrawings();
  };

  const handleRemoveDrawing = async (index: number) => {
    try {
      if (drawingFiles.length === 0 || !roomId || index >= drawingFiles.length) {
        return;
      }
      
      const {
        data: existingPrefs,
        error: fetchError
      } = await supabase.from('room_design_preferences').select('drawings').eq('room_id', roomId).maybeSingle();
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      const existingDrawings = existingPrefs?.drawings || [];
      if (existingDrawings.length > 0 && index < existingDrawings.length) {
        // Remove the specific drawing at the index
        const updatedDrawings = [...existingDrawings];
        updatedDrawings.splice(index, 1);
        
        const {
          error: updateError
        } = await supabase.from('room_design_preferences').update({
          drawings: updatedDrawings,
          updated_at: new Date().toISOString()
        }).eq('room_id', roomId);
        
        if (updateError) throw updateError;
      }
      
      // Update local state
      setDrawingFiles(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      
      toast({
        title: "Success",
        description: "Drawing removed successfully."
      });
    } catch (error) {
      console.error('Error removing drawing:', error);
      toast({
        title: "Error",
        description: "Failed to remove drawing. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Add functionality for updating file tags
  const handleUpdateTags = async (fileType: string, index: number, newTags: string[]) => {
    if (!roomId) return;
    
    try {
      let files;
      let field;
      
      // Determine which file array and database field to update
      if (fileType === 'rendering') {
        files = renderingFiles;
        field = 'renderings';
      } else if (fileType === 'drawing') {
        files = drawingFiles;
        field = 'drawings';
      } else if (fileType === 'blueprint') {
        // For blueprints, we'll update the design_assets array
        field = 'design_assets';
      } else {
        throw new Error('Invalid file type');
      }
      
      // Update the UI state
      if (fileType === 'rendering') {
        setRenderingFiles(prev => {
          const updated = [...prev];
          if (index < updated.length) {
            updated[index] = { ...updated[index], tags: newTags };
          }
          return updated;
        });
      } else if (fileType === 'drawing') {
        setDrawingFiles(prev => {
          const updated = [...prev];
          if (index < updated.length) {
            updated[index] = { ...updated[index], tags: newTags };
          }
          return updated;
        });
      } else if (fileType === 'blueprint' && blueprintFile) {
        setBlueprintFile({
          ...blueprintFile,
          tags: newTags
        });
      }
      
      // Save tags in design preferences tags_metadata
      const {
        data: preferences,
        error: fetchError
      } = await supabase.from('room_design_preferences')
                        .select('tags_metadata')
                        .eq('room_id', roomId)
                        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching preferences:', fetchError);
        throw fetchError;
      }
      
      // Create or update the tags_metadata field
      let tagsMetadata = preferences?.tags_metadata ? 
                         (typeof preferences.tags_metadata === 'object' ? 
                          preferences.tags_metadata as Record<string, any> : 
                          {}) : 
                         {};
      
      if (!tagsMetadata[field]) {
        tagsMetadata[field] = {};
      }
      
      if (fileType === 'blueprint') {
        // For blueprints, update the matching asset in the design_assets array
        const {
          data: designPrefs,
          error: assetsError
        } = await supabase.from('room_design_preferences')
                          .select('design_assets')
                          .eq('room_id', roomId)
                          .maybeSingle();
        
        if (assetsError && assetsError.code !== 'PGRST116') {
          throw assetsError;
        }
        
        if (designPrefs?.design_assets) {
          const designAssets = Array.isArray(designPrefs.design_assets) ? 
                              designPrefs.design_assets as any[] : 
                              [];
          
          const updatedAssets = designAssets.map((asset: any) => {
            if (asset.tags && asset.tags.includes('Blueprint')) {
              return {
                ...asset,
                tags: newTags
              };
            }
            return asset;
          });
          
          const {
            error: updateError
          } = await supabase.from('room_design_preferences').update({
            design_assets: updatedAssets as Json,
            updated_at: new Date().toISOString()
          }).eq('room_id', roomId);
          
          if (updateError) throw updateError;
        }
      } else {
        // For other file types, update the tags metadata
        tagsMetadata[field][index.toString()] = newTags;
        
        const {
          error: updateError
        } = await supabase.from('room_design_preferences').update({
          tags_metadata: tagsMetadata as Json,
          updated_at: new Date().toISOString()
        }).eq('room_id', roomId);
        
        if (updateError) {
          console.error('Error updating tags:', updateError);
          throw updateError;
        }
      }
      
      toast({
        title: "Success",
        description: "Tags updated successfully."
      });
    } catch (error) {
      console.error('Error updating tags:', error);
      toast({
        title: "Error",
        description: "Failed to update tags. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Design Assets</h2>
        
        <div className="space-y-8">
          {/* Blueprints Section */}
          <CategorySection
            title="Blueprints"
            roomId={roomId}
            currentRoom={currentRoom}
            files={blueprintFile ? [blueprintFile] : []}
            onUpload={handleUploadBlueprint}
            onDelete={() => handleRemoveBlueprint()}
            onUpdateTags={(index, tags) => handleUpdateTags('blueprint', index, tags)}
            propertyPhotos={propertyPhotos}
          />
          
          {/* Renderings Section */}
          <CategorySection
            title="Renderings"
            roomId={roomId}
            currentRoom={currentRoom}
            files={renderingFiles}
            onUpload={handleAddRenderings}
            onDelete={(index) => handleRemoveRendering(index !== undefined ? index : renderingFiles.length - 1)}
            onUpdateTags={(index, tags) => handleUpdateTags('rendering', index, tags)}
            propertyPhotos={propertyPhotos}
          />
          
          {/* Drawings Section */}
          <CategorySection
            title="Drawings"
            roomId={roomId}
            currentRoom={currentRoom}
            files={drawingFiles}
            onUpload={handleAddDrawings}
            onDelete={(index) => handleRemoveDrawing(index !== undefined ? index : drawingFiles.length - 1)}
            onUpdateTags={(index, tags) => handleUpdateTags('drawing', index, tags)}
            propertyPhotos={propertyPhotos}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignAssetsCard;
