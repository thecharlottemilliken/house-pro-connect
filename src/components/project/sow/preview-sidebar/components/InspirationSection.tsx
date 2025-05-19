
import React from 'react';
import { RoomAssetWithType } from '../hooks/useRoomAssets';
import { Image } from 'lucide-react';

interface InspirationSectionProps {
  inspirationAssets: RoomAssetWithType[];
  onPreview?: (url: string) => void;
}

export function InspirationSection({ inspirationAssets, onPreview }: InspirationSectionProps) {
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
        {inspirationAssets.map((asset, index) => (
          <div 
            key={`inspiration-${asset.roomName}-${index}-${asset.url.substring(0, 10)}`}
            className="aspect-square rounded-md overflow-hidden border border-gray-200 cursor-pointer"
            onClick={() => onPreview && onPreview(asset.url)}
          >
            <img 
              src={asset.url} 
              alt={asset.name || `Inspiration ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Failed to load inspiration image:", asset.url);
                e.currentTarget.src = "https://placehold.co/100x100?text=Image+Not+Found";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
