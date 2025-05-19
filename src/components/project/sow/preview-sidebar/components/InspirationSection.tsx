
import React, { useState } from 'react';
import { RoomAssetWithType } from '../hooks/useRoomAssets';
import { Image, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface InspirationSectionProps {
  inspirationAssets: RoomAssetWithType[];
  onPreview?: (url: string) => void;
}

export function InspirationSection({ inspirationAssets, onPreview }: InspirationSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (inspirationAssets.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-100">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-left">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
            <Image className="h-4 w-4 text-gray-500" />
            Inspiration ({inspirationAssets.length})
          </h3>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
