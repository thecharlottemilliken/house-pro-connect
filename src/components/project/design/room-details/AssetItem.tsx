
import React from 'react';
import { FileText, Eye, Download, X, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AssetItemProps {
  asset: { name: string; url: string; tags?: string[]; };
  index: number;
  onViewAsset?: (asset: { name: string; url: string; type: string }) => void;
  onManageTags?: (index: number) => void;
  onRemoveAsset?: (index: number) => void;
}

const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  index,
  onViewAsset,
  onManageTags,
  onRemoveAsset
}) => {
  const getAssetType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else {
      return 'other';
    }
  };

  const handleViewClick = () => {
    if (onViewAsset) {
      onViewAsset({
        name: asset.name,
        url: asset.url,
        type: getAssetType(asset.url)
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-lg">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium truncate max-w-[180px]">{asset.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex items-center">
            <Tag className="h-3 w-3 text-gray-400 mr-1" />
            <span className="text-xs text-gray-500">
              {asset.tags[0]}{asset.tags.length > 1 ? ` +${asset.tags.length - 1}` : ''}
            </span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-1 text-gray-400 hover:text-gray-700"
              title="Options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onSelect={() => onManageTags && onManageTags(index)} 
              className="cursor-pointer"
            >
              <Tag className="h-4 w-4 mr-2" />
              Manage Tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onSelect={handleViewClick} 
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onSelect={() => onRemoveAsset && onRemoveAsset(index)} 
              className="text-red-500 cursor-pointer"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AssetItem;
