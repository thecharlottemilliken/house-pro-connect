
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RoomMeasurementsCard from "./RoomMeasurementsCard";
import BeforePhotosCard from "./BeforePhotosCard";
import DesignAssetsCard from "./DesignAssetsCard";
import PinterestInspirationSection from "./PinterestInspirationSection";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";
import SelectProjectFilesDialog from "./SelectProjectFilesDialog";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useRoomDesign } from "@/hooks/useRoomDesign";
import { supabase } from "@/integrations/supabase/client";

interface RoomDetailsProps {
  currentRoom: string;
  propertyId?: string;
  propertyPhotos?: string[];
  propertyBlueprint?: string | null;
  designPreferences?: any;
  onSelectBeforePhotos?: (area: string, photos: string[]) => void;
  onUploadBeforePhotos?: (area: string, photos: string[]) => void;
  onAddProjectFiles?: (area: string, files: string[]) => void;
  onSaveMeasurements?: (area: string, measurements: any) => void;
  onAddDesigner?: () => void;
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
  getRoomIdByName?: (roomName: string) => string | undefined;
  projectId?: string;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({
  currentRoom,
  propertyId,
  propertyPhotos = [],
  propertyBlueprint,
  designPreferences,
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  onAddProjectFiles,
  onSaveMeasurements,
  onAddDesigner,
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
  getRoomIdByName,
  projectId
}) => {
  // State for dialogs
  const [isSelectPhotosOpen, setIsSelectPhotosOpen] = useState(false);
  const [isSelectFilesOpen, setIsSelectFilesOpen] = useState(false);
  
  // State for selected materials
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  // Room ID for the current room
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  
  // Room preferences from the hook
  const { createRoomIfNeeded } = useRoomDesign(propertyId);

  // Parse property photos to avoid undefined
  const parsedPropertyPhotos = propertyPhotos || [];
  
  // Get room measurements from design preferences
  const roomMeasurements = designPreferences?.roomMeasurements?.[currentRoom.toLowerCase().replace(/\s+/g, '_')] || {};
  
  // Get before photos for this room
  const beforePhotos = designPreferences?.beforePhotos?.[currentRoom.toLowerCase().replace(/\s+/g, '_')] || [];

  // Check if this room has renderings
  const hasRenderings = designPreferences?.hasRenderings?.[currentRoom.toLowerCase().replace(/\s+/g, '_')] || false;
  
  // Get rendering images for this room
  const renderingImages = designPreferences?.renderingImages?.[currentRoom.toLowerCase().replace(/\s+/g, '_')] || [];

  // Effect to set room ID
  useEffect(() => {
    if (getRoomIdByName && currentRoom) {
      const id = getRoomIdByName(currentRoom);
      setRoomId(id);
    }
  }, [getRoomIdByName, currentRoom]);

  // Function to ensure the room exists
  useEffect(() => {
    const ensureRoomExists = async () => {
      if (propertyId && currentRoom && !roomId) {
        const room = await createRoomIfNeeded(propertyId, currentRoom);
        if (room) {
          setRoomId(room.id);
        }
      }
    };
    
    ensureRoomExists();
  }, [propertyId, currentRoom, roomId, createRoomIfNeeded]);

  // Handle selecting photos from property
  const handleSelectPhotos = () => {
    setIsSelectPhotosOpen(true);
  };

  // Handle final selection of photos
  const handleConfirmPhotoSelection = () => {
    if (onSelectBeforePhotos && selectedPhotos.length > 0) {
      onSelectBeforePhotos(currentRoom, selectedPhotos);
      setIsSelectPhotosOpen(false);
      setSelectedPhotos([]);
    } else {
      setIsSelectPhotosOpen(false);
    }
  };

  // Handle photo select/deselect
  const handlePhotoSelection = (photoUrl: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPhotos(prev => [...prev, photoUrl]);
    } else {
      setSelectedPhotos(prev => prev.filter(url => url !== photoUrl));
    }
  };

  // Handle selecting files
  const handleSelectFiles = () => {
    setIsSelectFilesOpen(true);
  };

  // Handle final selection of files
  const handleConfirmFileSelection = () => {
    if (onAddProjectFiles && selectedFiles.length > 0) {
      onAddProjectFiles(currentRoom, selectedFiles);
      setIsSelectFilesOpen(false);
      setSelectedFiles([]);
    } else {
      setIsSelectFilesOpen(false);
    }
  };

  // Handle file select/deselect
  const handleFileSelection = (fileUrl: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles(prev => [...prev, fileUrl]);
    } else {
      setSelectedFiles(prev => prev.filter(url => url !== fileUrl));
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="measurements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="before-photos">Before Photos</TabsTrigger>
          <TabsTrigger value="design-assets">Design Assets</TabsTrigger>
          <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="pt-6">
          <RoomMeasurementsCard 
            roomName={currentRoom}
            existingMeasurements={roomMeasurements}
            onSave={(measurements) => {
              if (onSaveMeasurements) {
                onSaveMeasurements(currentRoom, measurements);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="before-photos" className="pt-6">
          <BeforePhotosCard
            roomName={currentRoom}
            beforePhotos={beforePhotos}
            onSelectPhotosClick={handleSelectPhotos}
          />

          <SelectPropertyPhotosDialog
            isOpen={isSelectPhotosOpen}
            onClose={() => setIsSelectPhotosOpen(false)}
            onConfirm={handleConfirmPhotoSelection}
            propertyPhotos={parsedPropertyPhotos}
            onSelectPhoto={handlePhotoSelection}
            selectedPhotos={selectedPhotos}
          />
        </TabsContent>

        <TabsContent value="design-assets" className="pt-6">
          <DesignAssetsCard
            hasRenderings={hasRenderings}
            renderingImages={renderingImages}
            onAddRenderings={onAddRenderings}
            onAddDrawings={onAddDrawings}
            onAddBlueprints={onAddBlueprints}
            propertyBlueprint={propertyBlueprint}
            propertyId={propertyId}
            currentRoom={currentRoom}
            propertyPhotos={parsedPropertyPhotos}
          />

          <SelectProjectFilesDialog
            isOpen={isSelectFilesOpen}
            onClose={() => setIsSelectFilesOpen(false)}
            onConfirm={handleConfirmFileSelection}
            designAssets={designPreferences?.designAssets || []}
            onSelectFile={handleFileSelection}
            selectedFiles={selectedFiles}
          />
        </TabsContent>

        <TabsContent value="inspiration" className="pt-6">
          <PinterestInspirationSection 
            roomName={currentRoom}
            roomId={roomId}
            projectId={projectId}
          />
        </TabsContent>
      </Tabs>

      <div className="pt-6 mt-6 border-t border-gray-100">
        <h3 className="text-lg font-medium mb-4">Design Team</h3>
        
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500 mb-4">
            You haven't added any designers to this room yet.
          </p>
          
          <Button
            onClick={onAddDesigner}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Add Designer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
