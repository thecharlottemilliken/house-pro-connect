import React, { useEffect } from "react";
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
  // Notify parent if there are any initial files (e.g., from DB)
  useEffect(() => {
    if (initialFiles.length > 0 && onFilesUploaded) {
      onFilesUploaded(initialFiles);
    }
  }, [initialFiles, onFilesUploaded]);

  // Handle completed uploads from EnhancedFileUpload
  const handleUploadComplete = (files: FileWithPreview[]) => {
    console.log(`Upload complete: ${files.length} new file(s)`);
    
    // Pass all files to parent
    if (onFilesUploaded) {
      onFilesUploaded(files);
    }

    toast({
      title: "Upload Complete",
      description: `${files.length} file(s) uploaded successfully.`,
    });
  };

  // Default room tag options
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
        multiple
        label="Upload Files"
        description="Upload property photos, blueprints, or drawings"
        onUploadComplete={handleUploadComplete}
        roomOptions={roomTagOptions}
        maxConcurrentUploads={5}
        autoUpload
        initialFiles={initialFiles} // pass these for preview only, if EnhancedFileUpload supports it
      />
    </div>
  );
}
