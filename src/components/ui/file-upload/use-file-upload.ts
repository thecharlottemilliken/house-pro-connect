
import { useState } from "react";
import { FileWithPreview } from "./types";
import { processFiles } from "./upload-service";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileUpload = (
  uploadedFiles: FileWithPreview[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>,
  onUploadComplete?: (files: FileWithPreview[]) => void
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
      setIsUploading(true);

      // Process and upload files
      const uploadProgress = (id: string, progress: number) => {
        setUploadedFiles(prevFiles => 
          prevFiles.map(file => 
            file.id === id ? { ...file, progress } : file
          )
        );
      };

      const processedFiles = await processFiles(files, uploadProgress);
      
      // Update files state with processed files
      setUploadedFiles(prevFiles => [...prevFiles, ...processedFiles]);
      
      // Call callback if provided with all files
      if (onUploadComplete) {
        onUploadComplete([...uploadedFiles, ...processedFiles]);
      }
      
      // Calculate success/error counts
      const successCount = processedFiles.filter(file => file.status === 'complete').length;
      const errorCount = processedFiles.filter(file => file.status === 'error').length;
      
      // Show appropriate toast
      if (errorCount === 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}.`
        });
      } else if (successCount === 0) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${errorCount} file${errorCount !== 1 ? 's' : ''}.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Upload Partially Complete",
          description: `Uploaded ${successCount} file${successCount !== 1 ? 's' : ''}, ${errorCount} failed.`,
          variant: "warning"
        });
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading files.",
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
