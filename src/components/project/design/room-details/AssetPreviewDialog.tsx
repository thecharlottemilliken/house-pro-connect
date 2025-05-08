
import React from 'react';
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AssetPreviewDialogProps {
  asset: { name: string; url: string; type: string } | null;
  onOpenChange: (open: boolean) => void;
}

const AssetPreviewDialog: React.FC<AssetPreviewDialogProps> = ({
  asset,
  onOpenChange
}) => {
  if (!asset) return null;

  return (
    <Dialog open={!!asset} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-w-3xl h-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 flex items-center justify-center">
          {asset.type === 'image' ? (
            <img 
              src={asset.url} 
              alt={asset.name} 
              className="max-w-full max-h-[70vh] object-contain" 
            />
          ) : asset.type === 'pdf' ? (
            <iframe 
              src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(asset.url)}`}
              className="w-full h-[70vh]" 
              title={asset.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-10">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500">Preview not available</p>
              <Button className="mt-4" onClick={() => {}}>
                Download
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetPreviewDialog;
