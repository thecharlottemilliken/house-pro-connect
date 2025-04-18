
import React from 'react';
import { FileImage, Download, Eye, Loader } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PreviewSidebarProps {
  projectData: any;
  propertyDetails: any;
}

type AssetType = 'inspiration' | 'before-photos' | 'drawings' | 'renderings' | 'blueprints';

export function PreviewSidebar({ projectData, propertyDetails }: PreviewSidebarProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<AssetType>('inspiration');
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  
  const designPreferences = projectData?.design_preferences || {};
  const renderingImages = designPreferences.renderingImages || [];
  const beforePhotos = designPreferences.beforePhotos || {};
  const blueprintUrl = propertyDetails?.blueprint_url;
  const inspirationImages = designPreferences.inspirationImages || [];
  const drawings = designPreferences.drawings || [];

  // For debugging
  console.log("Design Preferences:", designPreferences);
  console.log("Renderings:", renderingImages);
  console.log("Before Photos:", beforePhotos);
  console.log("Inspiration Images:", inspirationImages);
  console.log("Drawings:", drawings);
  console.log("Blueprint URL:", blueprintUrl);

  const handlePreview = (url: string) => {
    setIsPreviewLoading(true);
    setPreviewUrl(url);
  };

  const handleImageLoad = () => {
    setIsPreviewLoading(false);
  };

  const handleImageError = () => {
    setIsPreviewLoading(false);
    console.error("Error loading image:", previewUrl);
  };

  const getFilteredAssets = () => {
    switch (selectedType) {
      case 'inspiration':
        return Array.isArray(inspirationImages) ? inspirationImages.map((url: string, index: number) => ({
          name: `Inspiration ${index + 1}`,
          room: 'Design',
          url
        })) : [];
      case 'before-photos':
        return Object.entries(beforePhotos || {}).flatMap(([room, photos]) => 
          Array.isArray(photos) ? photos.map((url, index) => ({
            name: `Photo ${index + 1}`,
            room,
            url
          })) : []
        );
      case 'drawings':
        return Array.isArray(drawings) ? drawings.map((url: string, index: number) => ({
          name: `Drawing ${index + 1}`,
          room: 'Design',
          url
        })) : [];
      case 'renderings':
        return Array.isArray(renderingImages) ? renderingImages.map((url: string, index: number) => ({
          name: `Rendering ${index + 1}`,
          room: 'Design',
          url
        })) : [];
      case 'blueprints':
        return blueprintUrl ? [{
          name: 'Blueprint',
          room: 'Property',
          url: blueprintUrl
        }] : [];
      default:
        return [];
    }
  };

  const FileListItem = ({ name, room, url }: { name: string; room: string; url: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <FileImage className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{room}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={url}
          download
          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="w-4 h-4" />
        </a>
        <button
          onClick={() => handlePreview(url)}
          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const filteredAssets = getFilteredAssets();

  return (
    <>
      <div className="w-[320px] border-r bg-background h-[calc(100vh-56px)] flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold mb-2">Build the SOW</h1>
          <p className="text-gray-500 mb-6">Create a detailed statement of work.</p>
          
          <h2 className="text-lg font-semibold mb-4">Project Assets</h2>
          <Select value={selectedType} onValueChange={(value: AssetType) => setSelectedType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select asset type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="inspiration">Inspiration</SelectItem>
              <SelectItem value="before-photos">Before Photos</SelectItem>
              <SelectItem value="drawings">Drawings</SelectItem>
              <SelectItem value="renderings">Renderings</SelectItem>
              <SelectItem value="blueprints">Blueprints</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Files</h3>
            <div className="space-y-1">
              {filteredAssets.map((asset, index) => (
                <FileListItem
                  key={`${asset.name}-${index}`}
                  name={asset.name}
                  room={asset.room}
                  url={asset.url}
                />
              ))}
              {filteredAssets.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No {selectedType.replace('-', ' ')} available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            {isPreviewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Loader className="w-10 h-10 text-gray-400 animate-spin" />
              </div>
            )}
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-contain bg-black/5"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
