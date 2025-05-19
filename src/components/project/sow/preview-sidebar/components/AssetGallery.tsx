import React from 'react';
import { RoomAssetWithType } from '../hooks/useRoomAssets';
import { AssetTypeSection } from './AssetTypeSection';
import { LoadingSkeleton } from './LoadingSkeleton';
import { FileListItem } from './FileListItem';
import { Badge } from '@/components/ui/badge';
import { getTagDefinition } from '@/utils/assetTagUtils';

interface AssetGalleryProps {
  filteredAssets: RoomAssetWithType[];
  assetGroups: {
    design: RoomAssetWithType[];
    "before-photo": RoomAssetWithType[];
    inspiration: RoomAssetWithType[];
  };
  isLoading: boolean;
  selectedRoom: string;
  onPreview?: (url: string) => void;
  tagsMetadata?: any;
}

export function AssetGallery({ 
  filteredAssets, 
  assetGroups, 
  isLoading, 
  selectedRoom,
  onPreview,
  tagsMetadata
}: AssetGalleryProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 px-4">
        <p className="text-gray-500 text-center">
          {selectedRoom === "all"
            ? "No assets found for this project."
            : `No assets found for ${selectedRoom}.`}
        </p>
      </div>
    );
  }

  // Helper to render tags for an asset
  const renderTags = (asset: RoomAssetWithType) => {
    if (!asset.tags || asset.tags.length === 0) return null;
    
    // Get important tags to show (limit to 2)
    const importantTags = asset.tags
      .filter(tag => !tag.startsWith('type:') && !tag.startsWith('room:'))
      .slice(0, 2);
      
    if (importantTags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {importantTags.map(tagId => {
          const tagDef = getTagDefinition(tagId, tagsMetadata);
          return (
            <Badge 
              key={tagId}
              variant="outline" 
              className="text-xs py-0 h-5"
              style={{ 
                borderLeftColor: tagDef.color || undefined,
                borderLeftWidth: tagDef.color ? '2px' : undefined
              }}
            >
              {tagDef.label}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {assetGroups["before-photo"].length > 0 && (
        <AssetTypeSection title="Before Photos" count={assetGroups["before-photo"].length}>
          {assetGroups["before-photo"].map((asset, index) => (
            <div key={`before-${index}`} className="mb-2">
              <FileListItem
                asset={asset}
                onPreview={onPreview}
                tagsMetadata={tagsMetadata}
              />
              {renderTags(asset)}
            </div>
          ))}
        </AssetTypeSection>
      )}

      {assetGroups.design.length > 0 && (
        <AssetTypeSection title="Design" count={assetGroups.design.length}>
          {assetGroups.design.map((asset, index) => (
            <div key={`design-${index}`} className="mb-2">
              <FileListItem
                asset={asset}
                onPreview={onPreview}
                tagsMetadata={tagsMetadata}
              />
              {renderTags(asset)}
            </div>
          ))}
        </AssetTypeSection>
      )}

      {/* We don't show inspiration here since that's in the separate InspirationSection */}
    </div>
  );
}
