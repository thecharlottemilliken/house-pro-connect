
import { useState, useCallback } from "react";
import { FileWithPreview } from "./types";
import { processFiles, uploadFile, extractTags } from "./upload-service";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileUpload = (
  uploadedFiles: FileWithPreview[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>,
  onUploadComplete?: (files: FileWithPreview[]) => void,
  initialTags: string[] = []
) => {
  const [isUploading, setIsUploading] = useState(false);

  const checkAuthBeforeUpload = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    const isAuthenticated = !!data.session;
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleProcessFiles = async (files: FileList) => {
    if (files.length === 0) return;

    try {
      // Check authentication first
      const isAuthenticated = await checkAuthBeforeUpload();
      if (!isAuthenticated) return;
      
      setIsUploading(true);

      console.log("Processing", files.length, "files with initial tags:", initialTags);
      
      // Process files for preview, passing initial tags
      const processedFiles = await processFiles(files, initialTags);
      
      // Add files to state with 'uploading' status
      setUploadedFiles(prevFiles => [...prevFiles, ...processedFiles]);
      
      // Upload each file
      const completedFiles: FileWithPreview[] = [];
      
      for (const file of processedFiles) {
        try {
          if (!file.file) {
            console.warn(`File object missing for ${file.name}`);
            continue;
          }
          
          // Update status to uploading
          setUploadedFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === file.id 
                ? { ...f, status: 'uploading' as const, progress: 10 } 
                : f
            )
          );
          
          // Upload to Supabase storage with tags
          const url = await uploadFile(file.file, 'property-files', file.tags);
          
          // Update with permanent URL and complete status
          const updatedFile = { 
            ...file, 
            url, 
            status: 'complete' as const, 
            progress: 100 
          };
          
          // Update in state
          setUploadedFiles(prevFiles => 
            prevFiles.map(f => f.id === file.id ? updatedFile : f)
          );
          
          completedFiles.push(updatedFile);
          
          console.log(`Uploaded file ${file.name} with tags: ${file.tags.join(', ')}`);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          
          // Update with error status
          setUploadedFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === file.id 
                ? { ...f, status: 'error' as const, errorMessage: 'Upload failed' } 
                : f
            )
          );
          
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
        }
      }
      
      // Call the callback with completed files
      if (completedFiles.length > 0 && onUploadComplete) {
        console.log("Calling onUploadComplete with completed files:", completedFiles);
        onUploadComplete(completedFiles);
      }
      
      // Show success message
      if (completedFiles.length > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${completedFiles.length} file${completedFiles.length !== 1 ? 's' : ''}`
        });
      }
      
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during file upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const addTag = (fileId: string, tag: string) => {
    setUploadedFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId
          ? { ...file, tags: [...new Set([...file.tags, tag])] }
          : file
      )
    );
  };

  const removeTag = (fileId: string, tag: string) => {
    setUploadedFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId
          ? { ...file, tags: file.tags.filter(t => t !== tag) }
          : file
      )
    );
  };

  return {
    isUploading,
    handleProcessFiles,
    removeFile,
    addTag,
    removeTag,
    checkAuthBeforeUpload
  };
};
