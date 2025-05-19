
import React from "react";
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
            onUploadComplete={onUploadComplete}
            label="Drop your inspiration images here"
            description="Upload images in JPG, PNG format"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadInspirationModal;
