
import React, { useState, useMemo } from 'react';
import { ProjectInfoHeader } from './components/ProjectInfoHeader';
import { RoomSelector } from './components/RoomSelector';
import { AssetGallery } from './components/AssetGallery';
import { InspirationSection } from './components/InspirationSection';
import { useRoomAssets } from './hooks/useRoomAssets';
import { useRoomOptions } from './hooks/useRoomOptions';
import { useAssetFiltering } from './hooks/useAssetFiltering';
import { mergeTagsMetadata, defaultTagsMetadata, generateRoomTags } from '@/utils/assetTagUtils';

export interface PreviewSidebarProps {
  projectData: any;
  propertyDetails: any;
  onPreview?: (url: string) => void;
}

export function PreviewSidebar({ projectData, propertyDetails, onPreview }: PreviewSidebarProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  
  // Custom hooks for data management
  const { allAssets, isLoading, rooms } = useRoomAssets(projectData, propertyDetails);
  const { roomOptions } = useRoomOptions(projectData, propertyDetails, allAssets);
  const { filteredAssets, assetGroups, inspirationAssets } = useAssetFiltering(allAssets, selectedRoom);
  
  // Generate merged tags metadata with project-specific room tags
  const tagsMetadata = useMemo(() => {
    // Generate room tags from project rooms
    const roomTags = generateRoomTags(rooms);
    
    // Get custom tags from project data if available
    const projectTagsMetadata = projectData?.design_preferences?.tagsMetadata || {};
    
    // Merge default, room-generated, and project-specific tags
    return mergeTagsMetadata({
      ...projectTagsMetadata,
      tags: {
        ...projectTagsMetadata.tags,
        ...roomTags
      }
    });
  }, [rooms, projectData?.design_preferences?.tagsMetadata]);
  
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
      
      <InspirationSection 
        inspirationAssets={inspirationAssets} 
        onPreview={onPreview}
        tagsMetadata={tagsMetadata}
      />
      
      <div className="flex-1 overflow-auto">
        <AssetGallery
          filteredAssets={filteredAssets}
          assetGroups={assetGroups}
          isLoading={isLoading}
          selectedRoom={selectedRoom}
          onPreview={onPreview}
          tagsMetadata={tagsMetadata}
        />
      </div>
    </div>
  );
}
