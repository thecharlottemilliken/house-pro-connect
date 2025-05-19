
import React, { useState } from 'react';
import { ProjectInfoHeader } from './components/ProjectInfoHeader';
import { RoomSelector } from './components/RoomSelector';
import { AssetGallery } from './components/AssetGallery';
import { InspirationSection } from './components/InspirationSection';
import { RoomMeasurementsSection } from './components/RoomMeasurementsSection';
import { useRoomAssets } from './hooks/useRoomAssets';
import { useRoomOptions } from './hooks/useRoomOptions';
import { useAssetFiltering } from './hooks/useAssetFiltering';

export interface PreviewSidebarProps {
  projectData: any;
  propertyDetails: any;
  onPreview?: (url: string) => void;
}

export function PreviewSidebar({ projectData, propertyDetails, onPreview }: PreviewSidebarProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  
  // Custom hooks for data management
  const { allAssets, isLoading } = useRoomAssets(projectData, propertyDetails);
  const { roomOptions } = useRoomOptions(projectData, propertyDetails, allAssets);
  const { filteredAssets, assetGroups, inspirationAssets } = useAssetFiltering(allAssets, selectedRoom);

  // Get room measurements for the selected room with improved key normalization
  const getRoomMeasurements = () => {
    if (selectedRoom === "all" || !projectData?.design_preferences?.roomMeasurements) {
      return undefined;
    }
    
    // Debug the available measurements
    console.log("Available measurements keys:", 
      Object.keys(projectData.design_preferences.roomMeasurements || {}));
    
    const roomMeasurements = projectData.design_preferences.roomMeasurements;
    
    // Try different key formats to find measurements
    const normalizedRoomKey = selectedRoom.toLowerCase().replace(/\s+/g, '_');
    const camelCaseKey = selectedRoom.replace(/\s+(.)/g, (_, c) => c.toUpperCase());
    const titleCaseKey = selectedRoom.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Try different formats to find the measurements
    const possibleKeys = [
      selectedRoom,
      normalizedRoomKey,
      camelCaseKey,
      titleCaseKey,
      selectedRoom.toLowerCase(),
      selectedRoom.toUpperCase()
    ];
    
    console.log("Looking for measurements with keys:", possibleKeys);
    
    // Find the first key that has measurements
    for (const key of possibleKeys) {
      if (roomMeasurements[key]) {
        console.log("Found measurements with key:", key, roomMeasurements[key]);
        return roomMeasurements[key];
      }
    }
    
    console.log("No measurements found for room:", selectedRoom);
    return undefined;
  };

  const roomMeasurements = getRoomMeasurements();
  
  // Debug the measurements we found
  console.log("Selected room:", selectedRoom);
  console.log("Room measurements for display:", roomMeasurements);

  return (
    <div className="h-full bg-background border-r flex flex-col">
      <ProjectInfoHeader 
        projectData={projectData}
        propertyDetails={propertyDetails}
      />
      
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold mb-4">Project Assets</h2>
        <RoomSelector
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          roomOptions={roomOptions}
        />
      </div>
      
      {/* Room Measurements Section with enhanced debugging */}
      <RoomMeasurementsSection 
        measurements={roomMeasurements}
        selectedRoom={selectedRoom}
      />
      
      {/* Inspiration Section */}
      <InspirationSection 
        inspirationAssets={inspirationAssets} 
        onPreview={onPreview}
      />
      
      <div className="flex-1 overflow-auto">
        <AssetGallery
          filteredAssets={filteredAssets}
          assetGroups={assetGroups}
          isLoading={isLoading}
          selectedRoom={selectedRoom}
          onPreview={onPreview}
        />
      </div>
    </div>
  );
}
