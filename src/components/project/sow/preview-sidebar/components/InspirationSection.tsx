
import React from 'react';
import { RoomAssetWithType } from '../hooks/useRoomAssets';
import { Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTagDefinition } from '@/utils/assetTagUtils';

interface InspirationSectionProps {
  inspirationAssets: RoomAssetWithType[];
  onPreview?: (url: string) => void;
  tagsMetadata?: any;
}

export function InspirationSection({ 
  inspirationAssets, 
  onPreview,
  tagsMetadata 
}: InspirationSectionProps) {
  if (inspirationAssets.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 px-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1.5">
        <Image className="h-4 w-4 text-gray-500" />
        Inspiration ({inspirationAssets.length})
      </h3>
      
      <div className="grid grid-cols-3 gap-2">
        {inspirationAssets.map((asset, index) => {
          // Get room tag if available
          const roomTag = asset.tags?.find(tag => tag.startsWith('room:'));
          const roomDef = roomTag ? getTagDefinition(roomTag, tagsMetadata) : null;
          
          return (
            <div 
              key={`inspiration-${asset.roomName}-${index}`}
              className="aspect-square rounded-md overflow-hidden border border-gray-200 group relative"
              onClick={() => onPreview && onPreview(asset.url)}
            >
              <img 
                src={asset.url} 
                alt={asset.name || `Inspiration ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                onError={(e) => {
                  console.error("Failed to load inspiration image:", asset.url);
                  e.currentTarget.src = "https://placehold.co/100x100?text=Image+Not+Found";
                }}
              />
              
              {/* Room badge */}
              {roomDef && (
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-1 left-1 text-xs opacity-90"
                  style={{ 
                    backgroundColor: `${roomDef.color}30` || '#f3f4f630', 
                    color: roomDef.color || 'inherit',
                    borderLeft: `2px solid ${roomDef.color}`
                  }}
                >
                  {roomDef.label}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
