
// Import uuid as a regular dependency
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "./types";

/**
 * Formats file size to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Uploads a file to Supabase storage
 */
export const uploadFile = async (file: File): Promise<{ url: string; error: Error | null }> => {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error("User is not authenticated");
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('properties')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Upload service error:", error);
    return { url: "", error: error as Error };
  }
};

/**
 * Processes multiple files for upload
 */
export const processFiles = async (
  files: FileList,
  onProgressUpdate?: (id: string, progress: number) => void
): Promise<FileWithPreview[]> => {
  const fileArray: FileWithPreview[] = [];

  // Convert FileList to array
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const id = uuidv4();
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    fileArray.push({
      id,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      previewUrl,
      progress: 0,
      status: 'uploading',
      tags: []
    });
  }

  // Process uploads
  const uploadedFiles = await Promise.all(
    fileArray.map(async (fileItem, index) => {
      const file = files[index];
      
      try {
        // Report initial progress
        if (onProgressUpdate) {
          onProgressUpdate(fileItem.id, 10);
        }
        
        // Start upload
        const { url, error } = await uploadFile(file);
        
        // Report progress updates
        if (onProgressUpdate) {
          onProgressUpdate(fileItem.id, 100);
        }
        
        if (error) {
          throw error;
        }
        
        // Update fileItem with URL and status
        return {
          ...fileItem,
          url,
          progress: 100,
          status: 'complete' as const
        };
      } catch (error) {
        console.error("Error uploading file:", error);
        
        // Update fileItem with error status
        return {
          ...fileItem,
          progress: 0,
          status: 'error' as const,
          errorMessage: (error as Error).message
        };
      }
    })
  );

  return uploadedFiles;
};
