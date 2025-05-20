
import React, { useState } from 'react';
import { FileUpload, FileWithPreview, extractUrls } from "@/components/ui/file-upload";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface PhotoControlsProps {
  propertyPhotos: string[];
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
}

const PhotoControls = ({
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos
}: PhotoControlsProps) => {
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);

  // Handler to extract URLs from FileWithPreview objects and pass them to the parent component
  const handleUploadComplete = (files: FileWithPreview[]) => {
    const urls = extractUrls(files);
    onUploadBeforePhotos(urls);
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <Dialog open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
        <Button
          variant="outline"
          onClick={() => setIsSelectDialogOpen(true)}
          className="w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
        >
          Select from files
        </Button>
        
        <SelectPropertyPhotosDialog
          photos={propertyPhotos}
          onSelect={onSelectBeforePhotos}
          open={isSelectDialogOpen}
          onOpenChange={setIsSelectDialogOpen}
        />
      </Dialog>
      
      <FileUpload
        label="Upload"
        description="Upload additional photos of the room's current state"
        accept="image/*"
        multiple={true}
        onUploadComplete={handleUploadComplete}
        className="w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
      />
    </div>
  );
};

export default PhotoControls;
