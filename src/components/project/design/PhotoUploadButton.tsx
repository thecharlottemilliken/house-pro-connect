
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { EnhancedFileUpload, FileWithPreview, extractUrls } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PhotoUploadButtonProps {
  onUploadComplete: (photoUrls: string[]) => void;
  className?: string;
  variant?: "default" | "outline";
  label?: string;
  propertyId?: string; // Added propertyId prop
}

const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  onUploadComplete,
  className,
  variant = "outline",
  label = "Upload",
  propertyId // Use propertyId for storage
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = async (files: FileWithPreview[]) => {
    // Debug logging for uploaded files
    console.log("PhotoUploadButton - Files uploaded:", files);
    
    if (!files.length) return;
    
    setIsUploading(true);
    
    try {
      // For files with actual File objects (new uploads), we need to store them in Supabase Storage
      const filesToUpload = files.filter(f => f.file && !f.url?.startsWith('https://'));
      const permanentUrls: string[] = [];

      // First gather any already permanent URLs
      const existingPermanentUrls = files
        .filter(f => f.url?.startsWith('https://'))
        .map(f => f.url as string);
      
      permanentUrls.push(...existingPermanentUrls);
      
      // Upload files to Supabase Storage if propertyId is provided
      if (propertyId && filesToUpload.length > 0) {
        for (const fileItem of filesToUpload) {
          if (fileItem.file) {
            const fileName = `${Date.now()}-${fileItem.name}`;
            const filePath = `${propertyId}/${fileName}`;
            
            // Upload to Supabase storage
            const { data, error } = await supabase
              .storage
              .from('property-files')
              .upload(filePath, fileItem.file);
              
            if (error) {
              console.error("Storage upload error:", error);
              toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive"
              });
              continue; // Skip to the next file
            }
            
            // Get public URL
            const { data: urlData } = supabase
              .storage
              .from('property-files')
              .getPublicUrl(filePath);
              
            if (urlData && urlData.publicUrl) {
              permanentUrls.push(urlData.publicUrl);
            }
          }
        }
      } else if (filesToUpload.length > 0) {
        // No propertyId, but we have files to upload - can't create permanent URLs
        console.warn("PropertyId not provided - can't store files permanently");
        toast({
          title: "Warning",
          description: "Files may not be saved permanently",
          variant: "default"
        });
        
        // Extract temporary URLs for now
        const tempUrls = extractUrls(filesToUpload);
        permanentUrls.push(...tempUrls);
      }
      
      console.log("PhotoUploadButton - Permanent URLs to be saved:", permanentUrls);
      
      if (permanentUrls.length > 0) {
        onUploadComplete(permanentUrls);
      }
    } catch (error) {
      console.error("Error during file upload process:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
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
        className,
        isUploading ? "opacity-70 pointer-events-none" : ""
      )}
      isUploading={isUploading}
    />
  );
};

export default React.memo(PhotoUploadButton);
