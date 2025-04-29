
import React, { useState, useEffect } from "react";
import { FileWithPreview, RoomTagOption, EnhancedFileUpload } from "@/components/ui/file-upload";
import { toast } from "@/hooks/use-toast";

interface PropertyFileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFilesUploaded?: (files: FileWithPreview[]) => void;
  initialFiles?: FileWithPreview[];
  roomOptions?: RoomTagOption[];
  label?: string;
  description?: string;
}

export function PropertyFileUpload({ 
  accept = "image/*, .pdf, .dwg",
  multiple = true,
  onFilesUploaded,
  initialFiles = [],
  roomOptions = [],
  label = "Upload Files",
  description = "Upload property photos, blueprints, or drawings"
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
    
    // Update our internal state with the new files
    setUploadedFiles(prev => {
      // Create a map of existing file IDs to avoid duplicates
      const existingIds = new Set(prev.map(file => file.id));
      
      // Only add files that don't already exist in the array
      const newFiles = files.filter(file => !existingIds.has(file.id));
      
      // Combine existing files with new ones
      const updatedFiles = [...prev, ...newFiles];
      console.log(`Updated files list now has ${updatedFiles.length} files`);
      
      return updatedFiles;
    });
    
    // Call the parent's callback with all files
    if (onFilesUploaded) {
      // We need to use the current state to ensure we pass all files
      setUploadedFiles(currentFiles => {
        onFilesUploaded(currentFiles);
        return currentFiles;
      });
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
        accept={accept}
        multiple={multiple}
        label={label}
        description={description}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        onUploadComplete={handleUploadComplete}
        roomOptions={roomTagOptions}
      />
    </div>
  );
}
