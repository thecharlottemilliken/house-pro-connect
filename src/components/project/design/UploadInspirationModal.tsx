
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileUpload, FileWithPreview, extractUrls } from "@/components/ui/file-upload";
import { toast } from "@/hooks/use-toast";
import { uploadFile } from "@/components/ui/file-upload/upload-service";

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

  // Handle file upload completion from the FileUpload component
  const handleUploadComplete = (files: FileWithPreview[]) => {
    // Extract URLs from the FileWithPreview objects
    const validUrls = extractUrls(files);
    
    if (validUrls.length > 0) {
      onUploadComplete(validUrls);
      toast({
        title: "Upload Complete",
        description: `Added ${validUrls.length} inspiration ${validUrls.length === 1 ? 'image' : 'images'} to ${roomName}`,
      });
      onClose(); // Close the modal after successful upload
    } else {
      toast({
        title: "Upload Failed",
        description: "No valid images were uploaded",
        variant: "destructive"
      });
    }
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
