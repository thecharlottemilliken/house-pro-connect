
import React from 'react';
import { FileImage, Download, Eye, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RoomAssetWithType } from '../hooks/useRoomAssets';
import { getTagDefinition } from '@/utils/assetTagUtils';

interface FileListItemProps {
  asset?: RoomAssetWithType;
  name?: string;
  fileName?: string;
  onViewClick?: () => void;
  onPreview?: (url: string) => void;
  tagsMetadata?: any;
}

export function FileListItem({ 
  asset, 
  name, 
  fileName,
  onViewClick,
  onPreview,
  tagsMetadata
}: FileListItemProps) {
  // If we're using the asset object directly
  if (asset) {
    const handlePreview = () => {
      if (onPreview) {
        onPreview(asset.url);
      }
    };
    
    // Filter important tags to display (limit to 2)
    const displayTags = asset.tags 
      ? asset.tags
        .filter(tag => !tag.startsWith('type:') && !tag.startsWith('room:'))
        .slice(0, 2)
      : [];

    return (
      <div className="flex flex-col gap-1 py-4 border-b border-gray-100 last:border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FileImage className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{asset.name}</p>
              <p className="text-xs text-gray-500">{asset.roomName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={asset.url}
              download
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={handlePreview}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Display tags if available */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1 ml-12 mt-0.5">
            {displayTags.map((tagId, idx) => {
              const tagDef = getTagDefinition(tagId, tagsMetadata);
              return (
                <Badge 
                  key={`${asset.url}-tag-${idx}`} 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0 h-5"
                  style={{ 
                    backgroundColor: `${tagDef.color}30` || '#f3f4f630', 
                    color: tagDef.color || 'inherit',
                    borderLeft: `2px solid ${tagDef.color}`
                  }}
                >
                  {tagDef.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  
  // Legacy support for the older prop pattern
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <FileImage className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{fileName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={fileName}
          download
          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="w-4 h-4" />
        </a>
        <button
          onClick={onViewClick}
          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
