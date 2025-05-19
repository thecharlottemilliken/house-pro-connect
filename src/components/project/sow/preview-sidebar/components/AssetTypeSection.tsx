
import React from 'react';
import { FileListItem } from './FileListItem';
import { RoomAssetWithType } from '../hooks/useRoomAssets';

interface AssetTypeSectionProps {
  title: string;
  assets: RoomAssetWithType[];
  onPreview?: (url: string) => void; // Make this prop optional
}

export function AssetTypeSection({ title, assets, onPreview }: AssetTypeSectionProps) {
  if (assets.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-2 px-4">
        {title} ({assets.length})
      </h3>
      
      <div className="space-y-1 px-4">
        {assets.map((asset, index) => (
          <FileListItem
            key={`${asset.type}-${asset.roomName}-${index}`}
            asset={asset}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
}
