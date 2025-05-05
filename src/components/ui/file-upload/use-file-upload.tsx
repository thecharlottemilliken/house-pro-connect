
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileWithPreview } from "./types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateFileStatus, createPreviewUrl, processFiles, uploadFile } from "./utils";

export function useFileUpload(
  uploadedFiles: FileWithPreview[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>,
  onUploadComplete?: (files: FileWithPreview[]) => void
) {
  const [isUploading, setIsUploading] = useState(false);

  // Check for authentication before upload
  const checkAuthBeforeUpload = async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  // Handle file processing and upload
  const handleProcessFiles = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      setIsUploading(true);
      
      try {
        // Process files for preview
        const processedFiles = await processFiles(files);
        
        // Add files to the state with 'uploading' status
        setUploadedFiles((currentFiles) => [
          ...currentFiles,
          ...processedFiles
        ]);

        // Upload each file
        const uploadPromises = processedFiles.map(async (file) => {
          try {
            if (!file.file) return file;
            
            const uploadedUrl = await uploadFile(file.file);
            
            // Update file status to 'complete'
            const updatedFile = {
              ...file,
              url: uploadedUrl,
              status: 'complete' as const
            };
            
            // Update the file in state
            setUploadedFiles((currentFiles) =>
              currentFiles.map((f) =>
                f.id === file.id ? updatedFile : f
              )
            );
            
            return updatedFile;
          } catch (error) {
            console.error("Error uploading file:", error);
            
            // Update file status to 'error'
            const errorFile = updateFileStatus(file, 'error');
            
            setUploadedFiles((currentFiles) =>
              currentFiles.map((f) =>
                f.id === file.id ? errorFile : f
              )
            );
            
            toast({
              title: "Upload Error",
              description: `Failed to upload ${file.name}`,
              variant: "destructive"
            });
            
            return errorFile;
          }
        });

        // Wait for all uploads to complete
        const completedFiles = await Promise.all(uploadPromises);
        
        // Call onUploadComplete with completed files
        if (onUploadComplete) {
          onUploadComplete(completedFiles);
        }
        
        // Show success toast
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${completedFiles.filter(f => f.status === 'complete').length} file(s)`
        });
        
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload Error",
          description: "An error occurred during the upload process",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    },
    [setUploadedFiles, onUploadComplete]
  );

  // Remove a file
  const removeFile = useCallback(
    (id: string) => {
      setUploadedFiles((currentFiles) =>
        currentFiles.filter((file) => file.id !== id)
      );
    },
    [setUploadedFiles]
  );
  
  // Add a tag
  const addTag = useCallback(
    (id: string, tag: string) => {
      setUploadedFiles((currentFiles) =>
        currentFiles.map((file) => {
          if (file.id === id) {
            // Only add the tag if it doesn't already exist
            if (!file.tags.includes(tag)) {
              return {
                ...file,
                tags: [...file.tags, tag]
              };
            }
          }
          return file;
        })
      );
    },
    [setUploadedFiles]
  );
  
  // Remove a tag
  const removeTag = useCallback(
    (id: string, tag: string) => {
      setUploadedFiles((currentFiles) =>
        currentFiles.map((file) => {
          if (file.id === id) {
            return {
              ...file,
              tags: file.tags.filter(t => t !== tag)
            };
          }
          return file;
        })
      );
    },
    [setUploadedFiles]
  );

  return {
    isUploading,
    handleProcessFiles,
    removeFile,
    addTag,
    removeTag,
    checkAuthBeforeUpload
  };
}
