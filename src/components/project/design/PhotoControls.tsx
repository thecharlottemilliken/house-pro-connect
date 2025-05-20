
import React, { useState } from 'react';
import { EnhancedFileUpload, FileWithPreview } from "@/components/ui/file-upload";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handler to extract URLs from FileWithPreview objects and pass them to the parent component
  const handleUploadComplete = (files: FileWithPreview[]) => {
    console.log("PhotoControls - handleUploadComplete called with files:", files);
    
    // Extract only complete files with valid URLs
    const validFiles = files.filter(file => file.status === 'complete' && file.url);
    
    if (validFiles.length > 0) {
      // Extract URLs from valid files
      const urls = validFiles.map(file => file.url as string);
      console.log("PhotoControls - extracted URLs from uploaded files:", urls);
      
      // Pass the URLs to the parent component
      onUploadBeforePhotos(urls);
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${validFiles.length} file${validFiles.length !== 1 ? 's' : ''}`
      });
    } else {
      console.warn("No valid files to extract URLs from");
    }
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
      
      <EnhancedFileUpload
        label="Upload"
        description="Upload additional photos of the room's current state"
        accept="image/*"
        multiple={true}
        onUploadComplete={handleUploadComplete}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        roomOptions={[
          { value: "before", label: "Before" }
        ]}
      />
    </div>
  );
};

export default PhotoControls;
