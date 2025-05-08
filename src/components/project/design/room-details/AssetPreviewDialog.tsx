
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AssetPreviewDialogProps {
  asset: { name: string; url: string } | null;
  onOpenChange: () => void;
}

const AssetPreviewDialog: React.FC<AssetPreviewDialogProps> = ({
  asset,
  onOpenChange
}) => {
  if (!asset) return null;
  
  const fileExtension = asset.url.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  const isPDF = fileExtension === 'pdf';

  return (
    <Dialog open={!!asset} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{asset.name}</DialogTitle>
          <DialogDescription>
            {isImage ? 'Image Preview' : isPDF ? 'PDF Document' : 'File Preview'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto min-h-[300px] flex items-center justify-center p-4 bg-gray-50 rounded-md">
          {isImage ? (
            <img 
              src={asset.url} 
              alt={asset.name} 
              className="max-w-full max-h-[60vh] object-contain" 
            />
          ) : isPDF ? (
            <iframe
              src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(asset.url)}`}
              className="w-full h-[60vh]"
              title={asset.name}
            />
          ) : (
            <div className="text-center p-8">
              <p className="mb-4 text-gray-500">Preview not available for this file type</p>
              <Button asChild>
                <a href={asset.url} target="_blank" rel="noopener noreferrer">
                  Open File
                </a>
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onOpenChange}>
            Close
          </Button>
          <Button asChild className="ml-2">
            <a href={asset.url} target="_blank" rel="noopener noreferrer" download>
              Download
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetPreviewDialog;
