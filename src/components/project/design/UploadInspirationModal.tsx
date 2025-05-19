import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "@/hooks/use-toast";

interface UploadInspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (urls: string[]) => void;
  roomName: string;
}

const UploadInspirationModal: React.FC<UploadInspirationModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  roomName,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Handle file upload completion
  const handleUploadComplete = (files: Array<string | { url: string; status: string }>) => {
    setIsUploading(false);
    
    // Process the files to extract valid URLs
    const validUrls: string[] = files.map(file => {
      // Handle both string URLs and object formats
      if (typeof file === 'string') {
        return file; // Direct URL string
      } else if (file && typeof file === 'object' && file.url && file.status === 'complete') {
        return file.url; // Extract URL from file object
      }
      return '';
    }).filter(url => {
      // Only keep valid URLs (non-empty and starts with http)
      const isValid = url && (url.startsWith('http://') || url.startsWith('https://'));
      if (!isValid && url) {
        console.warn('Invalid URL filtered out:', url);
      }
      return isValid;
    });

    // If we have valid URLs, pass them to the parent component
    if (validUrls.length > 0) {
      onUploadComplete(validUrls);
      toast({
        title: "Upload Complete",
        description: `Added ${validUrls.length} inspiration ${validUrls.length === 1 ? 'image' : 'images'} to ${roomName}`,
      });
    } else {
      toast({
        title: "Upload Failed",
        description: "No valid images were uploaded",
        variant: "destructive"
      });
    }

    onClose(); // Close the modal after handling the upload
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Inspiration Images</DialogTitle>
          <DialogDescription>
            Add inspiration images for your {roomName}. You can upload multiple images at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <FileUpload
            accept="image/*"
            multiple={true}
            onUploadComplete={handleUploadComplete}
            label="Drop your inspiration images here"
            description="Upload images in JPG, PNG format"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadInspirationModal;
