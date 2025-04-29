
import { useState } from "react";
import { FileWithPreview } from "./types";
import { toast } from "@/hooks/use-toast";
import { processFiles, uploadFile } from "./upload-service";
import { supabase } from "@/integrations/supabase/client";

export function useFileUpload(
  uploadedFiles: FileWithPreview[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>,
  onUploadComplete?: (files: FileWithPreview[]) => void
) {
  const [isUploading, setIsUploading] = useState(false);

  const handleProcessFiles = async (files: FileList) => {
    setIsUploading(true);
    
    try {
      // Check authentication first
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You must be signed in to upload files.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      
      const newFiles = await processFiles(files, uploadedFiles);
      
      // Update state with new files
      setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Start uploading these files
      const uploadPromises = newFiles.map(async (fileWithPreview) => {
        return uploadFile(fileWithPreview, updateFileStatus);
      });
      
      // Process all uploads in parallel
      const completedFiles = (await Promise.all(uploadPromises)).filter(Boolean) as FileWithPreview[];
      
      if (completedFiles.length && onUploadComplete) {
        // Only call onUploadComplete once with all completed files
        onUploadComplete(completedFiles);
      }
      
      if (completedFiles.length > 0) {
        toast({
          title: "Upload Complete",
          description: `${completedFiles.length} file(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading files. Please ensure you're signed in.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const updateFileStatus = (
    fileId: string,
    status: FileWithPreview["status"],
    progress: number = 0,
    url?: string
  ) => {
    setUploadedFiles(prevFiles => 
      prevFiles.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            status,
            progress,
            url: url || file.url,
          };
        }
        return file;
      })
    );
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));

    toast({
      title: "File removed",
      description: `${fileToRemove?.name || "File"} has been removed`,
    });
  };

  const addTag = (fileId: string, tag: string) => {
    if (!tag.trim()) return;

    setUploadedFiles(prevFiles => 
      prevFiles.map(file => {
        if (file.id === fileId) {
          const updatedTags = file.tags.includes(tag) 
            ? file.tags 
            : [...file.tags, tag];
          return { ...file, tags: updatedTags };
        }
        return file;
      })
    );
  };

  const removeTag = (fileId: string, tag: string) => {
    setUploadedFiles(prevFiles => 
      prevFiles.map(file => {
        if (file.id === fileId) {
          return { ...file, tags: file.tags.filter(t => t !== tag) };
        }
        return file;
      })
    );
  };

  const checkAuthBeforeUpload = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to upload files.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return {
    isUploading,
    handleProcessFiles,
    removeFile,
    addTag,
    removeTag,
    checkAuthBeforeUpload
  };
}
