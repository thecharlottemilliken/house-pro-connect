
import React, { useState, useEffect } from "react";
import { EnhancedFileUpload, FileWithPreview, RoomTagOption } from "@/components/ui/enhanced-file-upload";
import { toast } from "@/hooks/use-toast";

interface PropertyFileUploadProps {
  onFilesUploaded?: (files: FileWithPreview[]) => void;
  initialFiles?: FileWithPreview[];
  roomOptions?: RoomTagOption[];
}

export function PropertyFileUpload({ 
  onFilesUploaded,
  initialFiles = [],
  roomOptions = []
}: PropertyFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>(initialFiles);
  
  useEffect(() => {
    // Update with initialFiles when they change
    if (initialFiles.length > 0) {
      setUploadedFiles(initialFiles);
    }
  }, [initialFiles]);

  // Handle completed uploads
  const handleUploadComplete = (files: FileWithPreview[]) => {
    console.log(`Upload complete callback received ${files.length} files`);
    if (onFilesUploaded) {
      onFilesUploaded(files);
    }

    toast({
      title: "Upload Complete",
      description: `${files.length} file(s) uploaded successfully.`,
    });
  };
  
  // Default room options if none provided
  const defaultRoomOptions: RoomTagOption[] = [
    { value: "livingRoom", label: "Living Room" },
    { value: "kitchen", label: "Kitchen" },
    { value: "bathroom", label: "Bathroom" },
    { value: "bedroom", label: "Bedroom" },
    { value: "office", label: "Office" },
    { value: "exterior", label: "Exterior" },
    { value: "blueprint", label: "Blueprint" },
  ];

  const roomTagOptions = roomOptions.length > 0 ? roomOptions : defaultRoomOptions;

  return (
    <div className="space-y-4">
      <EnhancedFileUpload
        accept="image/*, .pdf, .dwg"
        multiple={true}
        label="Upload Files"
        description="Upload property photos, blueprints, or drawings"
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        onUploadComplete={handleUploadComplete}
        roomOptions={roomTagOptions}
        maxConcurrentUploads={5} 
        autoUpload={true}
      />
    </div>
  );
}
