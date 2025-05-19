
import React, { useState } from 'react';
import { ProjectInfoHeader } from './components/ProjectInfoHeader';
import { RoomSelector } from './components/RoomSelector';
import { AssetGallery } from './components/AssetGallery';
import { useRoomAssets } from './hooks/useRoomAssets';
import { useRoomOptions } from './hooks/useRoomOptions';
import { useAssetFiltering } from './hooks/useAssetFiltering';

export interface PreviewSidebarProps {
  projectData: any;
  propertyDetails: any;
  onPreview?: (url: string) => void; // Make this prop optional
}

export function PreviewSidebar({ projectData, propertyDetails, onPreview }: PreviewSidebarProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  
  // Custom hooks for data management
  const { allAssets, isLoading } = useRoomAssets(projectData, propertyDetails);
  const { roomOptions } = useRoomOptions(projectData, propertyDetails, allAssets);
  const { filteredAssets, assetGroups } = useAssetFiltering(allAssets, selectedRoom);

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
      
      <div className="flex-1 overflow-auto">
        <AssetGallery
          filteredAssets={filteredAssets}
          assetGroups={assetGroups}
          isLoading={isLoading}
          selectedRoom={selectedRoom}
          onPreview={onPreview} // Pass the onPreview function down
        />
      </div>
    </div>
  );
}
