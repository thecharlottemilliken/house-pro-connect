
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

  const handleUploadComplete = (urls: string[]) => {
    console.log("Upload complete in modal, urls:", urls);
    
    // Filter out any blob URLs which won't persist
    const validUrls = urls.filter(url => 
      url.startsWith('http') || url.startsWith('https'));
      
    if (validUrls.length === 0) {
      toast({
        title: "Error",
        description: "No valid image URLs were uploaded",
        variant: "destructive"
      });
      return;
    }
    
    onUploadComplete(validUrls);
    onClose();
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
