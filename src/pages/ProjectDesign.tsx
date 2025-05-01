
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomDetails from '@/components/project/design/RoomDetails';
import { useProjectData } from '@/hooks/useProjectData';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProjectDesign = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projectData, propertyDetails, isLoading, error } = useProjectData(projectId);
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (projectData && projectData.renovation_areas) {
      // Set the current room to the first renovation area if it's not already set
      if (!currentRoom && projectData.renovation_areas.length > 0) {
        setCurrentRoom(projectData.renovation_areas[0]?.area || "");
      }
    }
  }, [projectData, currentRoom]);

  const handleRoomChange = (roomName: string) => {
    setCurrentRoom(roomName);
  };

  const getCurrentDesignAssets = () => {
    if (!projectData || !projectData.design_preferences) return [];
    
    const designPrefs = projectData.design_preferences;
    
    // Check if the room has specific design assets
    const roomAssets = designPrefs.designAssets?.filter(asset => 
      asset.room === currentRoom
    ) || [];
    
    return roomAssets;
  };

  const getCurrentBeforePhotos = () => {
    if (!projectData?.design_preferences?.beforePhotos) return [];
    
    // Get the before photos for the current room
    return projectData.design_preferences.beforePhotos[currentRoom] || [];
  };

  const getCurrentRoomMeasurements = () => {
    if (!projectData?.design_preferences?.roomMeasurements) return undefined;
    
    // Get the measurements for the current room
    return projectData.design_preferences.roomMeasurements[currentRoom];
  };

  const handleUploadAssets = async (newAssets: Array<{ name: string; url: string; type?: string }>) => {
    if (!projectId || !currentRoom) return;
    
    try {
      // Get current design preferences
      const designPrefs = projectData?.design_preferences || { hasDesigns: true };
      
      // Add room property to each asset
      const assetsWithRoom = newAssets.map(asset => ({
        ...asset,
        room: currentRoom
      }));
      
      // Prepare updated design assets
      const existingAssets = designPrefs.designAssets || [];
      const updatedAssets = [...existingAssets, ...assetsWithRoom];
      
      // Update design preferences
      const updatedDesignPrefs = {
        ...designPrefs,
        designAssets: updatedAssets
      };
      
      // Save to database
      const { error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPrefs
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Design assets uploaded successfully."
      });
      
    } catch (err) {
      console.error('Error uploading design assets:', err);
      toast({
        title: "Error",
        description: "Failed to upload design assets. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAsset = async (assetUrl: string) => {
    if (!projectId || !currentRoom) return;
    
    try {
      // Get current design preferences
      const designPrefs = projectData?.design_preferences || { hasDesigns: true };
      
      // Filter out the asset to remove
      const existingAssets = designPrefs.designAssets || [];
      const updatedAssets = existingAssets.filter(asset => asset.url !== assetUrl);
      
      // Update design preferences
      const updatedDesignPrefs = {
        ...designPrefs,
        designAssets: updatedAssets
      };
      
      // Save to database
      const { error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPrefs
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Design asset removed successfully."
      });
      
    } catch (err) {
      console.error('Error removing design asset:', err);
      toast({
        title: "Error",
        description: "Failed to remove design asset. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSelectProjectFiles = async (fileUrls: string[]) => {
    if (!projectId || !currentRoom || fileUrls.length === 0) return;
    
    try {
      // Get current design preferences
      const designPrefs = projectData?.design_preferences || { hasDesigns: true };
      
      // Create asset objects from selected files
      const newAssets = fileUrls.map(url => {
        const fileName = url.split('/').pop() || 'File';
        const fileType = url.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) 
          ? 'image/jpeg' 
          : (url.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
        
        return {
          name: fileName,
          url: url,
          type: fileType,
          room: currentRoom
        };
      });
      
      // Prepare updated design assets
      const existingAssets = designPrefs.designAssets || [];
      
      // Filter out any duplicates
      const filteredNewAssets = newAssets.filter(newAsset => 
        !existingAssets.some(existingAsset => existingAsset.url === newAsset.url)
      );
      
      const updatedAssets = [...existingAssets, ...filteredNewAssets];
      
      // Update design preferences
      const updatedDesignPrefs = {
        ...designPrefs,
        designAssets: updatedAssets
      };
      
      // Save to database
      const { error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPrefs
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${filteredNewAssets.length} files selected successfully.`
      });
      
    } catch (err) {
      console.error('Error selecting project files:', err);
      toast({
        title: "Error",
        description: "Failed to select project files. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSelectBeforePhotos = async (photos: string[]) => {
    if (!projectId || !currentRoom) return;
    
    try {
      // Get current design preferences
      const designPrefs = projectData?.design_preferences || { hasDesigns: true };
      
      // Prepare updated before photos
      const beforePhotos = designPrefs.beforePhotos || {};
      beforePhotos[currentRoom] = photos;
      
      // Update design preferences
      const updatedDesignPrefs = {
        ...designPrefs,
        beforePhotos
      };
      
      // Save to database
      const { error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPrefs
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Before photos updated successfully."
      });
      
    } catch (err) {
      console.error('Error updating before photos:', err);
      toast({
        title: "Error",
        description: "Failed to update before photos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUploadBeforePhotos = async (photoUrls: string[]) => {
    if (!projectId || !currentRoom || photoUrls.length === 0) return;
    
    try {
      // Get current design preferences
      const designPrefs = projectData?.design_preferences || { hasDesigns: true };
      
      // Prepare updated before photos
      const beforePhotos = designPrefs.beforePhotos || {};
      beforePhotos[currentRoom] = [...(beforePhotos[currentRoom] || []), ...photoUrls];
      
      // Update design preferences
      const updatedDesignPrefs = {
        ...designPrefs,
        beforePhotos
      };
      
      // Save to database
      const { error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPrefs
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Before photos uploaded successfully."
      });
      
    } catch (err) {
      console.error('Error uploading before photos:', err);
      toast({
        title: "Error",
        description: "Failed to upload before photos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveMeasurements = async (measurements: any) => {
    if (!projectId || !currentRoom) return;
    
    try {
      // Get current design preferences
      const designPrefs = projectData?.design_preferences || { hasDesigns: true };
      
      // Prepare updated room measurements
      const roomMeasurements = designPrefs.roomMeasurements || {};
      roomMeasurements[currentRoom] = measurements;
      
      // Update design preferences
      const updatedDesignPrefs = {
        ...designPrefs,
        roomMeasurements
      };
      
      // Save to database
      const { error } = await supabase
        .from('projects')
        .update({
          design_preferences: updatedDesignPrefs
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Room measurements saved successfully."
      });
      
    } catch (err) {
      console.error('Error saving room measurements:', err);
      toast({
        title: "Error",
        description: "Failed to save room measurements. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  const getCurrentRoomLocation = () => {
    if (!projectData || !projectData.renovation_areas) return undefined;
    
    const roomData = projectData.renovation_areas.find(room => room.area === currentRoom);
    return roomData?.location;
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{projectData?.title || "Project Design"}</h1>
        <p className="text-gray-500 mt-1">{propertyDetails?.address || ""}</p>
      </div>

      <div className="space-y-8">
        {projectData && projectData.renovation_areas && projectData.renovation_areas.length > 0 ? (
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {projectData.renovation_areas.map((room, index) => (
                <button
                  key={index}
                  onClick={() => handleRoomChange(room.area)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    currentRoom === room.area
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {room.area}
                </button>
              ))}
            </div>

            {currentRoom && (
              <RoomDetails 
                area={currentRoom}
                location={getCurrentRoomLocation()}
                designers={projectData.design_preferences?.designers}
                designAssets={getCurrentDesignAssets()}
                measurements={getCurrentRoomMeasurements()}
                onAddDesigner={() => {}}
                onUploadAssets={handleUploadAssets}
                onRemoveAsset={handleRemoveAsset}
                onSaveMeasurements={handleSaveMeasurements}
                propertyPhotos={propertyDetails?.home_photos || []}
                onSelectBeforePhotos={handleSelectBeforePhotos}
                onUploadBeforePhotos={handleUploadBeforePhotos}
                beforePhotos={getCurrentBeforePhotos()}
                projectId={projectId}
                onSelectProjectFiles={handleSelectProjectFiles}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No renovation areas defined for this project.</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              onClick={() => navigate(`/renovation-areas/${projectId}`)}
            >
              Define Renovation Areas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDesign;
