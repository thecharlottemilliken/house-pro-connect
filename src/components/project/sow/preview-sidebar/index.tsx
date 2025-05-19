
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import React, { useState } from 'react';
import { PreviewSidebar } from './PreviewSidebar';

interface PreviewSidebarWrapperProps {
  projectData: any;
  propertyDetails: any;
}

// Main export component with dialog functionality included
export function PreviewSidebarWrapper(props: PreviewSidebarWrapperProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  const handleImageLoad = () => setIsPreviewLoading(false);
  const handleImageError = () => {
    setIsPreviewLoading(false);
    console.error("Error loading image:", previewUrl);
  };

  return (
    <>
      <PreviewSidebar
        {...props}
        onPreview={(url: string) => {
          setIsPreviewLoading(true);
          setPreviewUrl(url);
        }}
      />

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

export { PreviewSidebar } from './PreviewSidebar';
