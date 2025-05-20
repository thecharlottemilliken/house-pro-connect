
import React, { useRef } from "react";
import { FileWithPreview, RoomTagOption } from "./types";
import { DropZone } from "./drop-zone";
import { FilesList } from "./files-list";
import { useFileUpload } from "./use-file-upload";

interface EnhancedFileUploadProps {
  accept?: string;
  multiple?: boolean;
  onUploadComplete?: (files: FileWithPreview[]) => void;
  label: string;
  description: string;
  uploadedFiles: FileWithPreview[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  allowUrlUpload?: boolean;
  roomOptions?: RoomTagOption[];
  className?: string;
  initialTags?: string[];
  isUploading?: boolean; // Added isUploading prop to reflect external loading state
}

export function EnhancedFileUpload({
  accept = "image/*,application/pdf",
  multiple = true,
  onUploadComplete,
  label,
  description,
  uploadedFiles,
  setUploadedFiles,
  allowUrlUpload = false,
  roomOptions = [],
  className = "",
  initialTags = [],
  isUploading: externalIsUploading = false, // External upload status
}: EnhancedFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    isUploading: internalIsUploading, 
    handleProcessFiles, 
    removeFile, 
    addTag, 
    removeTag,
    checkAuthBeforeUpload 
  } = useFileUpload(
    uploadedFiles, 
    setUploadedFiles,
    onUploadComplete,
    initialTags
  );
  
  // Combine internal and external uploading states
  const isUploading = internalIsUploading || externalIsUploading;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await handleProcessFiles(files);
    }
    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDrop = async (files: FileList) => {
    if (await checkAuthBeforeUpload()) {
      handleProcessFiles(files);
    }
  };

  const handleBoxClick = async () => {
    if (await checkAuthBeforeUpload()) {
      fileInputRef.current?.click();
    }
  };

  // Debug logging
  console.log(`EnhancedFileUpload rendering with initialTags:`, initialTags);

  return (
    <div className={`space-y-4 ${className} ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
      <DropZone 
        label={label}
        description={description}
        onDrop={handleDrop}
        onClick={handleBoxClick}
        disabled={isUploading}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {isUploading && (
        <div className="flex justify-center">
          <p className="text-sm text-gray-500">Uploading files...</p>
        </div>
      )}

      <FilesList 
        files={uploadedFiles}
        onRemoveFile={removeFile}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        roomOptions={roomOptions}
      />
    </div>
  );
}
