
import React from 'react';
import { FileListItem } from './FileListItem';

interface AssetTypeSectionProps {
  title: string;
  assets: any[];
}

export function AssetTypeSection({ title, assets }: AssetTypeSectionProps) {
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
          />
        ))}
      </div>
    </div>
  );
}
