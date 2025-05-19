
import React, { useState } from 'react';
import { FileListItem } from './FileListItem';
import { RoomAssetWithType } from '../hooks/useRoomAssets';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AssetTypeSectionProps {
  title: string;
  assets: RoomAssetWithType[];
  onPreview?: (url: string) => void;
}

export function AssetTypeSection({ title, assets, onPreview }: AssetTypeSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (assets.length === 0) return null;
  
  return (
    <div className="mb-2 border-b border-gray-100 last:border-b-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-left">
          <h3 className="text-sm font-medium text-gray-900">
            {title} ({assets.length})
          </h3>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-3">
          <div className="space-y-1">
            {assets.map((asset, index) => (
              <FileListItem
                key={`${asset.type}-${asset.roomName}-${index}`}
                asset={asset}
                onPreview={onPreview}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
