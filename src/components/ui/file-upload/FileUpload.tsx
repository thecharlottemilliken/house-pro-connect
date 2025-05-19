
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export interface FileUploadProps {
  label: string;
  description: string;
  accept?: string;
  multiple?: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  onUploadComplete: (uploadedUrls: string[]) => void;
  className?: string;
  children?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  description,
  accept = "*",
  multiple = false,
  maxFileSize = 5, // MB
  maxFiles = 10,
  onUploadComplete,
  className = "",
  children
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // Check number of files
    if (multiple && files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can upload a maximum of ${maxFiles} files at once`,
        variant: "destructive",
      });
      return;
    }

    // Check file size
    const maxSizeInBytes = maxFileSize * 1024 * 1024; // Convert MB to bytes
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSizeInBytes) {
        toast({
          title: "File too large",
          description: `${files[i].name} exceeds the maximum file size of ${maxFileSize}MB`,
          variant: "destructive",
        });
        return;
      }
    }

    // Start the upload process
    setIsUploading(true);
    try {
      // Generate temporary blob URLs for the files
      const blobUrls = Array.from(files).map(
        (file) => URL.createObjectURL(file)
      );
      
      onUploadComplete(blobUrls);
      e.target.value = ""; // Reset input
      
      toast({
        title: "Files processed",
        description: `Successfully uploaded ${files.length} file${files.length !== 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="file-upload"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        className={className}
        disabled={isUploading}
      >
        {isUploading ? "Processing..." : children || label}
      </Button>
      <p className="sr-only">{description}</p>
    </div>
  );
};
