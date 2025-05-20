
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { EnhancedFileUpload, FileWithPreview } from "@/components/ui/file-upload";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";
import { Dialog } from "@/components/ui/dialog";

interface EmptyPhotoStateProps {
  area?: string;
  propertyPhotos: string[];
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
}

const EmptyPhotoState = ({
  area = '',
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos
}: EmptyPhotoStateProps) => {
  // State to manage uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  
  // Handle upload complete event with proper URL extraction
  const handleUploadComplete = (files: FileWithPreview[]) => {
    console.log("EmptyPhotoState - handleUploadComplete called with files:", files);
    
    // Extract only URLs from completed files
    const urls = files
      .filter(file => file.status === 'complete' && file.url)
      .map(file => file.url as string);
    
    console.log("EmptyPhotoState - extracted URLs:", urls);
    
    if (urls.length > 0) {
      onUploadBeforePhotos(urls);
    }
  };
  
  // Debug initial render
  console.log(`EmptyPhotoState rendering for ${area}`);
  
  return (
    <div className="flex flex-col items-center justify-center text-center py-6">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Upload className="h-6 w-6 text-gray-500" />
      </div>
      <h4 className="font-semibold text-gray-900">No before photos added yet</h4>
      <p className="text-gray-500 max-w-md mt-1 mb-6">
        Upload photos of your {area.toLowerCase()} before renovation to document the transformation
      </p>
      
      <div className="grid grid-cols-2 gap-4 w-full mt-2">
        {propertyPhotos.length > 0 ? (
          <>
            <Dialog>
              <SelectPropertyPhotosDialog
                photos={propertyPhotos}
                onSelect={onSelectBeforePhotos}
                customButton={
                  <Button
                    variant="outline"
                    className="w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
                  >
                    Select from files
                  </Button>
                }
              />
            </Dialog>
            <EnhancedFileUpload
              label="Upload"
              description="Upload photos of the room's current state"
              accept="image/*"
              multiple={true}
              onUploadComplete={handleUploadComplete}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              roomOptions={[
                { value: "before", label: "Before" }
              ]}
              initialTags={["before"]} // Always tag uploads as "before" photos
            />
          </>
        ) : (
          <EnhancedFileUpload
            label="Upload"
            description="Upload photos of the room's current state"
            accept="image/*"
            multiple={true}
            onUploadComplete={handleUploadComplete}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            roomOptions={[
              { value: "before", label: "Before" }
            ]}
            initialTags={["before"]} // Always tag uploads as "before" photos
            className="col-span-2 w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
          />
        )}
      </div>
    </div>
  );
};

export default EmptyPhotoState;
