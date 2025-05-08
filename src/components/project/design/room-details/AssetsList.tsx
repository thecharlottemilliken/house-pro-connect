
import React from 'react';
import { FileText, Image, Tag, Eye, Trash } from "lucide-react";
import { FileTags } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";

interface AssetsListProps {
  designAssets?: Array<{ name: string; url: string; tags?: string[] }>;
  onViewAsset?: (asset: { name: string; url: string }) => void;
  onManageTags?: (index: number) => void;
  onRemoveAsset?: (index: number) => void;
}

const AssetsList: React.FC<AssetsListProps> = ({
  designAssets = [],
  onViewAsset,
  onManageTags,
  onRemoveAsset
}) => {
  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-purple-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  if (designAssets.length === 0) {
    return <p className="text-gray-500 text-sm py-2">No design assets have been added yet.</p>;
  }

  return (
    <div className="space-y-2">
      {designAssets.map((asset, index) => (
        <div 
          key={index}
          className="border border-gray-200 rounded-md p-3 bg-white"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getFileIcon(asset.url)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{asset.name}</p>
                
                {/* Tags display with improved component */}
                <div className="mt-1.5">
                  <FileTags 
                    tags={asset.tags || []} 
                    maxDisplay={3}
                  />
                  
                  {/* Add tag button if manage tags is available */}
                  {onManageTags && (
                    <Button
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onManageTags(index)}
                      className="h-6 px-2 py-0 text-xs flex items-center gap-1 mt-1 text-gray-500 hover:text-gray-900"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      Manage Tags
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-1">
              {onViewAsset && (
                <button 
                  onClick={() => onViewAsset(asset)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title="View asset"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              {onRemoveAsset && (
                <button 
                  onClick={() => onRemoveAsset(index)}
                  className="p-1 text-gray-500 hover:text-red-600 rounded"
                  title="Remove asset"
                >
                  <Trash className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetsList;
