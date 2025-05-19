
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

  // Handle file upload completion
  const handleUploadComplete = async (files: Array<string>) => {
    setIsUploading(true);
    
    try {
      // For blob URLs, we need to convert them to actual files and upload to Supabase
      const validUrls: string[] = [];
      
      for (const fileUrl of files) {
        // Skip empty URLs
        if (!fileUrl) continue;
        
        // If it's already a proper URL (from cloud storage), use it directly
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
          validUrls.push(fileUrl);
          continue;
        }
        
        // For blob URLs, fetch the file and upload to Supabase
        if (fileUrl.startsWith('blob:')) {
          try {
            // Fetch the file data from the blob URL
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            
            // Create a File object from the blob
            const fileName = `inspiration-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
            const file = new File([blob], fileName, { type: blob.type });
            
            // Upload to Supabase
            const { url, error } = await uploadFile(file);
            
            if (error) {
              console.error("Error uploading file:", error);
              toast({
                title: "Upload Error",
                description: `Failed to upload ${fileName}`,
                variant: "destructive"
              });
              continue;
            }
            
            if (url) {
              validUrls.push(url);
            }
          } catch (error) {
            console.error("Error processing blob URL:", error);
          }
        }
      }

      // If we have valid URLs, pass them to the parent component
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
    } catch (error) {
      console.error("Error processing uploads:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
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
