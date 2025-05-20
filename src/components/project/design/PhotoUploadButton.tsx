
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { EnhancedFileUpload, FileWithPreview } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";
import { filterValidPhotoUrls } from '@/utils/BeforePhotosService';

interface PhotoUploadButtonProps {
  onUploadComplete: (photoUrls: string[]) => void;
  className?: string;
  variant?: "default" | "outline";
  label?: string;
  disabled?: boolean;
}

const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  onUploadComplete,
  className,
  variant = "outline",
  label = "Upload",
  disabled = false
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = (files: FileWithPreview[]) => {
    setIsUploading(true);
    
    try {
      // Debug logging for uploaded files
      console.log("PhotoUploadButton - Files uploaded:", files);
      
      // Make sure we're only working with successfully uploaded files with permanent URLs
      const validFiles = files.filter(file => 
        file.status === 'complete' && 
        file.url && 
        !file.url.toString().startsWith('blob:')
      );
      
      if (validFiles.length === 0) {
        console.warn("PhotoUploadButton - No valid permanent URLs found in uploaded files");
        return;
      }
      
      // Extract URLs from valid files
      const urls = validFiles.map(file => file.url as string);
      console.log("PhotoUploadButton - Extracted permanent URLs:", urls);
      
      // Filter out any invalid URLs
      const validUrls = filterValidPhotoUrls(urls);
      
      if (validUrls.length > 0) {
        console.log("PhotoUploadButton - Passing valid URLs to parent:", validUrls);
        onUploadComplete(validUrls);
        
        // Clear uploaded files after successful upload
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error("Error handling upload complete:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <EnhancedFileUpload
      label={isUploading || disabled ? "Processing..." : label}
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
      disabled={isUploading || disabled}
    />
  );
};

export default React.memo(PhotoUploadButton);
