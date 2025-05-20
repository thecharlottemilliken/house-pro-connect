
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { EnhancedFileUpload, FileWithPreview, extractUrls } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";

interface PhotoUploadButtonProps {
  onUploadComplete: (photoUrls: string[]) => void;
  className?: string;
  variant?: "default" | "outline";
  label?: string;
}

const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  onUploadComplete,
  className,
  variant = "outline",
  label = "Upload"
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = (files: FileWithPreview[]) => {
    // Debug logging for uploaded files
    console.log("PhotoUploadButton - Files uploaded:", files);
    
    // Make sure we're only working with successfully uploaded files with permanent URLs
    const validFiles = files.filter(file => file.status === 'complete' && file.url && !file.url.startsWith('blob:'));
    
    if (validFiles.length === 0) {
      console.warn("PhotoUploadButton - No valid permanent URLs found in uploaded files");
      return;
    }
    
    // Extract URLs from valid files
    const urls = validFiles.map(file => file.url as string);
    console.log("PhotoUploadButton - Extracted permanent URLs:", urls);
    
    if (urls.length > 0) {
      onUploadComplete(urls);
      
      // Clear uploaded files after successful upload
      setUploadedFiles([]);
    }
  };

  return (
    <EnhancedFileUpload
      label={label}
      description="Upload photos of the room's current state"
      accept="image/*"
      multiple={true}
      onUploadComplete={handleUploadComplete}
      uploadedFiles={uploadedFiles}
      setUploadedFiles={setUploadedFiles}
      initialTags={["before"]} // Always tag uploads as "before" photos
      roomOptions={[
        { value: "before", label: "Before" }
      ]}
      className={cn(variant === "outline" 
        ? "border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90" 
        : "", 
        "font-medium uppercase tracking-wider py-6 w-full", 
        className)}
    />
  );
};

export default React.memo(PhotoUploadButton);
