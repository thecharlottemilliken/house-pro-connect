
import React from 'react';
import { AssetTypeSection } from './AssetTypeSection';
import { LoadingSkeleton } from './LoadingSkeleton';
import { RoomAssetWithType } from '../hooks/useRoomAssets';

interface AssetGalleryProps {
  filteredAssets: RoomAssetWithType[];
  assetGroups: {
    design: RoomAssetWithType[];
    'before-photo': RoomAssetWithType[];
    inspiration: RoomAssetWithType[];
  };
  isLoading: boolean;
  selectedRoom: string;
  onPreview?: (url: string) => void; // Make this prop optional
}

export function AssetGallery({ 
  filteredAssets, 
  assetGroups, 
  isLoading, 
  selectedRoom,
  onPreview 
}: AssetGalleryProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 py-4">
          No assets available for {selectedRoom === 'all' ? 'any rooms' : selectedRoom}
        </p>
      </div>
    );
  }

  return (
    <div>
      <AssetTypeSection 
        title="Design Assets" 
        assets={assetGroups.design} 
        onPreview={onPreview}
      />
      <AssetTypeSection 
        title="Before Photos" 
        assets={assetGroups['before-photo']} 
        onPreview={onPreview}
      />
      <AssetTypeSection 
        title="Inspiration" 
        assets={assetGroups.inspiration} 
        onPreview={onPreview}
      />
    </div>
  );
}
