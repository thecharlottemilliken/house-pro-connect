
import React from 'react';
import { FileImage, Download, Eye, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RoomAssetWithType } from '../hooks/useRoomAssets';

interface FileListItemProps {
  asset: RoomAssetWithType;
  onPreview?: (url: string) => void; // Make this prop optional
}

export function FileListItem({ asset, onPreview }: FileListItemProps) {
  const handlePreview = () => {
    if (onPreview) {
      onPreview(asset.url);
    }
  };
  
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
      {asset.tags && asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-12 mt-0.5">
          {asset.tags.map((tag, idx) => (
            <Badge 
              key={`${asset.url}-tag-${idx}`} 
              variant="secondary" 
              className="text-xs px-1.5 py-0 h-5 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
