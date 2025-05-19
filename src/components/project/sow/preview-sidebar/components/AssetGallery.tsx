
import React from 'react';
import { AssetTypeSection } from './AssetTypeSection';
import { LoadingSkeleton } from './LoadingSkeleton';

interface AssetGalleryProps {
  filteredAssets: any[];
  assetGroups: {
    design: any[];
    'before-photo': any[];
    inspiration: any[];
  };
  isLoading: boolean;
  selectedRoom: string;
}

export function AssetGallery({ filteredAssets, assetGroups, isLoading, selectedRoom }: AssetGalleryProps) {
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
      <AssetTypeSection title="Design Assets" assets={assetGroups.design} />
      <AssetTypeSection title="Before Photos" assets={assetGroups['before-photo']} />
      <AssetTypeSection title="Inspiration" assets={assetGroups.inspiration} />
    </div>
  );
}
