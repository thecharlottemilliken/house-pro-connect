import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CategorySection from "./CategorySection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DesignAssetsCardProps {
  hasRenderings: boolean;
  renderingImages?: string[];
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
  propertyBlueprint?: string | null;
  propertyId?: string;
  currentRoom: string; // Add this prop to track current room
}

// Define a ProjectFile type for consistency
interface ProjectFile {
  name: string;
  size: string;
  type: 'pdf' | 'xls' | 'jpg' | 'png';
  url: string;
}

const DesignAssetsCard = ({
  hasRenderings,
  renderingImages = [],
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
  propertyBlueprint,
  propertyId,
  currentRoom
}: DesignAssetsCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [blueprintFile, setBlueprintFile] = useState<{name: string; size: string; type: 'pdf' | 'xls' | 'jpg' | 'png'; url?: string} | null>(
    propertyBlueprint ? { name: "Blueprint.pdf", size: "1.2MB", type: 'pdf', url: propertyBlueprint } : null
  );
  const [renderingFiles, setRenderingFiles] = useState<{name: string; size: string; type: 'jpg' | 'png' | 'pdf'; url?: string}[]>([]);
  const [drawingFiles, setDrawingFiles] = useState<{name: string; size: string; type: 'jpg' | 'png' | 'pdf'; url?: string}[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // New states for the select from project files modal
  const [showSelectFilesDialog, setShowSelectFilesDialog] = useState(false);
  const [selectingFileType, setSelectingFileType] = useState<'blueprints' | 'renderings' | 'drawings' | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<ProjectFile[]>([]);

  // Effect to load data when component mounts or room changes
  useEffect(() => {
    if (propertyId && currentRoom) {
      console.log("Loading data for room:", currentRoom);
      fetchRoomId().then(() => {
        fetchExistingData();
      });
    }
  }, [propertyId, currentRoom]); // Add currentRoom as dependency

  // Function to fetch room ID for the current property and room
  const fetchRoomId = async () => {
    if (!propertyId || !currentRoom) {
      console.error("Missing propertyId or currentRoom");
      return;
    }
    
    try {
      console.log("Fetching room ID for property:", propertyId, "and room:", currentRoom);
      const { data: rooms, error } = await supabase
        .from('property_rooms')
        .select('id')
        .eq('property_id', propertyId)
        .eq('name', currentRoom)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }
      
      if (rooms) {
        console.log('Room ID set to:', rooms.id);
        setRoomId(rooms.id);
        return rooms.id;
      } else {
        console.log('No rooms found for property and room name');
      }
    } catch (error) {
      console.error('Error in fetchRoomId:', error);
    }
    return null;
  };

  // Function to fetch existing data from the database
  const fetchExistingData = async () => {
    try {
      const currentRoomId = roomId || await fetchRoomId();
      if (currentRoomId) {
        await Promise.all([
          fetchExistingDrawings(currentRoomId),
          fetchExistingRenderings(currentRoomId)
        ]);
      }
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
  const fetchExistingRenderings = async (currentRoomId: string) => {
    try {
      console.log("Fetching existing renderings for room:", currentRoomId);
      
      const { data: preferences, error } = await supabase
        .from('room_design_preferences')
        .select('renderings')
        .eq('room_id', currentRoomId)
        .maybeSingle();
          
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching renderings:', error);
        return;
      }
      
      if (preferences?.renderings) {
        console.log('Found existing renderings:', preferences.renderings);
        const files = preferences.renderings.map((url: string, index: number) => {
          const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
          return {
            name: `Rendering_${index + 1}.${fileType}`,
            size: "1.5MB",
            type: fileType as 'jpg' | 'png' | 'pdf',
            url: url
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
  const fetchExistingDrawings = async (currentRoomId: string) => {
    try {
      console.log("Fetching existing drawings for room ID:", currentRoomId);
        
      const { data: preferences, error } = await supabase
        .from('room_design_preferences')
        .select('drawings')
        .eq('room_id', currentRoomId)
        .maybeSingle();
          
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching drawings:', error);
        return;
      }
      
      if (preferences?.drawings) {
        console.log('Found existing drawings:', preferences.drawings);
        const files = preferences.drawings.map((url: string, index: number) => {
          const fileType = url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
          return {
            name: `Drawing_${index + 1}.${fileType}`,
            size: "1.2MB",
            type: fileType as 'jpg' | 'png' | 'pdf',
            url: url
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

  const handleUploadBlueprint = async (urls: string[]) => {
    if (!urls.length || !propertyId) return;

    try {
      setIsUploading(true);
      const { error } = await supabase
        .from('properties')
        .update({ blueprint_url: urls[0] })
        .eq('id', propertyId);

      if (error) throw error;
      
      setBlueprintFile({ name: "Blueprint.pdf", size: "1.2MB", type: 'pdf', url: urls[0] });

      toast({
        title: "Blueprint Added",
        description: "Your blueprint has been successfully uploaded."
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
    if (!propertyId) return;

    try {
      if (propertyBlueprint) {
        const filename = propertyBlueprint.split('/').pop();
        if (filename) {
          await supabase.storage
            .from('property-files')
            .remove([filename]);
        }
      }

      const { error } = await supabase
        .from('properties')
        .update({ blueprint_url: null })
        .eq('id', propertyId);

      if (error) throw error;
      
      setBlueprintFile(null);

      toast({
        title: "Blueprint Removed",
        description: "The blueprint has been successfully removed."
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

  const handleAddRenderings = async (urls: string[]) => {
    console.log("Adding rendering URLs:", urls);
    if (!propertyId || urls.length === 0) {
      console.log("Missing propertyId or URLs");
      return;
    }
    
    // Make sure we have a room ID
    let currentRoomId = roomId;
    if (!currentRoomId) {
      currentRoomId = await fetchRoomId();
      if (!currentRoomId) {
        toast({
          title: "Error",
          description: "Could not identify a room for this property.",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      // Get existing room design preferences
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('renderings')
        .eq('room_id', currentRoomId)
        .maybeSingle();
      
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
      const { data: existingRecord, error: checkError } = await supabase
        .from('room_design_preferences')
        .select('id')
        .eq('room_id', currentRoomId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking room design preferences:', checkError);
        throw checkError;
      }
      
      let updateError;
      
      if (existingRecord) {
        console.log("Updating existing record");
        // Update existing record
        const { error } = await supabase
          .from('room_design_preferences')
          .update({ 
            renderings: updatedRenderings,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', currentRoomId);
        
        updateError = error;
      } else {
        console.log("Creating new record");
        // Create new record
        const { error } = await supabase
          .from('room_design_preferences')
          .insert({ 
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
          url: url
        };
      });
      
      setRenderingFiles(prev => [...prev, ...newRenderings]);
      
      toast({
        title: "Success",
        description: "Renderings have been saved successfully."
      });

      // Refresh the data to ensure we have the latest
      fetchExistingRenderings(currentRoomId);
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

  const handleRemoveRenderings = async () => {
    try {
      if (renderingFiles.length === 0 || !propertyId) {
        return;
      }
      
      let currentRoomId = roomId;
      if (!currentRoomId) {
        currentRoomId = await fetchRoomId();
        if (!currentRoomId) {
          toast({
            title: "Error",
            description: "Could not identify a room for this property.",
            variant: "destructive"
          });
          return;
        }
      }
      
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('renderings')
        .eq('room_id', currentRoomId)
        .maybeSingle();
          
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      const existingRenderings = existingPrefs?.renderings || [];
      if (existingRenderings.length > 0) {
        const updatedRenderings = existingRenderings.slice(0, -1);
        
        const { error: updateError } = await supabase
          .from('room_design_preferences')
          .update({ 
            renderings: updatedRenderings,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', currentRoomId);
          
        if (updateError) throw updateError;
      }
      
      setRenderingFiles(prev => prev.slice(0, -1));
      
      toast({
        title: "Success",
        description: "Rendering removed successfully."
      });

      // Refresh the data to ensure we have the latest
      fetchExistingRenderings(currentRoomId);
    } catch (error) {
      console.error('Error removing rendering:', error);
      toast({
        title: "Error",
        description: "Failed to remove rendering. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddDrawings = async (urls: string[]) => {
    console.log("Adding drawing URLs:", urls);
    if (!propertyId || urls.length === 0) {
      console.log("Missing propertyId or URLs");
      return;
    }
    
    // Make sure we have a room ID
    let currentRoomId = roomId;
    if (!currentRoomId) {
      currentRoomId = await fetchRoomId();
      if (!currentRoomId) {
        toast({
          title: "Error",
          description: "Could not identify a room for this property.",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      console.log("Using room ID for drawings:", currentRoomId);
      
      // Get existing room design preferences
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('drawings')
        .eq('room_id', currentRoomId)
        .maybeSingle();
      
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
      const { data: existingRecord, error: checkError } = await supabase
        .from('room_design_preferences')
        .select('id')
        .eq('room_id', currentRoomId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking room design preferences:', checkError);
        throw checkError;
      }
      
      let updateError;
      
      if (existingRecord) {
        console.log("Updating existing record for drawings");
        // Update existing record
        const { error } = await supabase
          .from('room_design_preferences')
          .update({ 
            drawings: updatedDrawings,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', currentRoomId);
        
        updateError = error;
      } else {
        console.log("Creating new record for drawings");
        // Create new record
        const { error } = await supabase
          .from('room_design_preferences')
          .insert({ 
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
          url: url
        };
      });
      
      setDrawingFiles(prev => [...prev, ...newDrawings]);
      
      toast({
        title: "Success",
        description: "Drawings have been saved successfully."
      });

      // Refresh the data to ensure we have the latest
      fetchExistingDrawings(currentRoomId);
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

  const handleRemoveDrawings = async () => {
    try {
      if (drawingFiles.length === 0 || !propertyId) {
        return;
      }
      
      let currentRoomId = roomId;
      if (!currentRoomId) {
        currentRoomId = await fetchRoomId();
        if (!currentRoomId) {
          toast({
            title: "Error",
            description: "Could not identify a room for this property.",
            variant: "destructive"
          });
          return;
        }
      }
      
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('room_design_preferences')
        .select('drawings')
        .eq('room_id', currentRoomId)
        .maybeSingle();
          
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      const existingDrawings = existingPrefs?.drawings || [];
      if (existingDrawings.length > 0) {
        const updatedDrawings = existingDrawings.slice(0, -1);
        
        const { error: updateError } = await supabase
          .from('room_design_preferences')
          .update({ 
            drawings: updatedDrawings,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', currentRoomId);
          
        if (updateError) throw updateError;
      }
      
      setDrawingFiles(prev => prev.slice(0, -1));
      
      toast({
        title: "Success",
        description: "Drawing removed successfully."
      });

      // Refresh the data to ensure we have the latest
      fetchExistingDrawings(currentRoomId);
    } catch (error) {
      console.error('Error removing drawing:', error);
      toast({
        title: "Error",
        description: "Failed to remove drawing. Please try again.",
        variant: "destructive"
      });
    }
  };

  // New function to fetch project files
  const fetchProjectFiles = async () => {
    if (!propertyId) return;

    try {
      // Fetch files from the property_file_metadata table or similar
      // This is a placeholder - you'll need to implement according to your data model
      const { data, error } = await supabase
        .from('properties')
        .select('file_metadata')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      
      if (data && data.file_metadata) {
        const files: ProjectFile[] = [];
        
        // Convert the file metadata to ProjectFile format
        const metadata = data.file_metadata;
        if (Array.isArray(metadata)) {
          metadata.forEach((file: any) => {
            if (file.url) {
              const fileType = file.url.toLowerCase();
              let type: 'pdf' | 'xls' | 'jpg' | 'png' = 'jpg';
              
              if (fileType.endsWith('.pdf')) type = 'pdf';
              else if (fileType.endsWith('.xls') || fileType.endsWith('.xlsx')) type = 'xls';
              else if (fileType.endsWith('.png')) type = 'png';
              
              files.push({
                name: file.name || `File-${files.length + 1}`,
                size: file.size || "1MB",
                type,
                url: file.url
              });
            }
          });
        }
        
        setProjectFiles(files);
      }
    } catch (error) {
      console.error('Error fetching project files:', error);
      toast({
        title: "Error",
        description: "Failed to load project files",
        variant: "destructive"
      });
    }
  };

  // Handle opening the select files dialog
  const handleSelectFromProjectFiles = (fileType: 'blueprints' | 'renderings' | 'drawings') => {
    setSelectingFileType(fileType);
    fetchProjectFiles();
    setSelectedFiles([]);
    setShowSelectFilesDialog(true);
  };

  // Handle file selection in the dialog
  const toggleFileSelection = (file: ProjectFile) => {
    if (selectedFiles.some(f => f.url === file.url)) {
      setSelectedFiles(selectedFiles.filter(f => f.url !== file.url));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  // Handle confirming file selection
  const handleConfirmFileSelection = () => {
    if (!selectedFiles.length) {
      setShowSelectFilesDialog(false);
      return;
    }

    const urls = selectedFiles.map(file => file.url);

    switch (selectingFileType) {
      case 'blueprints':
        if (urls.length > 0) {
          handleUploadBlueprint([urls[0]]); // Only use the first URL for blueprints
        }
        break;
      case 'renderings':
        handleAddRenderings(urls);
        break;
      case 'drawings':
        handleAddDrawings(urls);
        break;
    }

    setShowSelectFilesDialog(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <CategorySection
          title="Blueprints"
          files={blueprintFile ? [blueprintFile] : []}
          onUpload={handleUploadBlueprint}
          onDelete={handleRemoveBlueprint}
          onSelectFromProjectFiles={() => handleSelectFromProjectFiles('blueprints')}
        />

        <CategorySection
          title="Renderings"
          files={renderingFiles}
          onUpload={handleAddRenderings}
          onDelete={handleRemoveRenderings}
          onSelectFromProjectFiles={() => handleSelectFromProjectFiles('renderings')}
        />

        <CategorySection
          title="Drawings"
          files={drawingFiles}
          onUpload={handleAddDrawings}
          onDelete={handleRemoveDrawings}
          onSelectFromProjectFiles={() => handleSelectFromProjectFiles('drawings')}
        />

        {/* Dialog for selecting from project files */}
        <Dialog open={showSelectFilesDialog} onOpenChange={setShowSelectFilesDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Select from Project Files</DialogTitle>
            </DialogHeader>
            
            <div className="my-4">
              {projectFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {projectFiles.map((file, index) => (
                    <div 
                      key={index}
                      onClick={() => toggleFileSelection(file)}
                      className={`cursor-pointer border rounded-md p-2 ${
                        selectedFiles.some(f => f.url === file.url) 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center mb-2 overflow-hidden rounded">
                        {file.type === 'pdf' ? (
                          <div className="text-gray-400 text-xs font-medium">PDF</div>
                        ) : file.type === 'xls' ? (
                          <div className="text-gray-400 text-xs font-medium">XLS</div>
                        ) : (
                          <img src={file.url} className="object-cover w-full h-full" alt={file.name} />
                        )}
                      </div>
                      <div className="text-xs truncate">{file.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No project files available.</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSelectFilesDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleConfirmFileSelection}
                disabled={selectedFiles.length === 0}
              >
                Add {selectedFiles.length > 0 ? `Selected Files (${selectedFiles.length})` : 'Files'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DesignAssetsCard;
