
import { FileWithPreview } from "./types";
import { createPreviewUrl } from "./utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Process files for preview and upload preparation
export const processFiles = async (
  files: FileList,
  initialTags: string[] = [],
  onProgress?: (id: string, progress: number) => void
): Promise<FileWithPreview[]> => {
  // Convert the FileList to an array of FileWithPreview objects
  return Array.from(files).map((file) => {
    const id = crypto.randomUUID();
    const previewUrl = createPreviewUrl(file);
    
    return {
      id,
      file, // Keep the file for later upload
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
      progress: 0,
      tags: initialTags,
      status: 'ready',
    };
  });
};

// Upload a single file to Supabase storage and return its URL
export const uploadFile = async (
  file: File, 
  bucketName: string = 'property-files',
  tags: string[] = [],
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.log(`Starting upload of ${file.name} to ${bucketName} bucket with tags: ${tags.join(', ')}`);
    
    // Check authentication status first
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.error('User not authenticated');
      throw new Error('Authentication required to upload files');
    }
    
    // Create a unique file path to prevent overwrites
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const filePath = `${timestamp}-${crypto.randomUUID()}.${fileExt}`;
    
    // Upload the file directly without attempting to create the bucket
    // The bucket should already exist with proper RLS policies
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        // Add metadata including tags for better organization
        fileMetadata: {
          tags: tags.join(','),
          uploadedAt: new Date().toISOString(),
          contentType: file.type
        }
      });
    
    if (error) {
      console.error(`Error uploading file: ${error.message}`);
      throw error;
    }
    
    console.log(`File uploaded successfully: ${data?.path}`);
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    const publicUrl = publicUrlData?.publicUrl;
    console.log(`Public URL generated: ${publicUrl}`);
    
    if (!publicUrl) {
      throw new Error('Failed to generate public URL for uploaded file');
    }
    
    return publicUrl;
  } catch (error: any) {
    console.error('Error in uploadFile:', error);
    toast({
      title: "Upload Error",
      description: error.message || "Failed to upload file",
      variant: "destructive"
    });
    throw error;
  }
};

// Upload multiple files and return their URLs
export const uploadMultipleFiles = async (
  files: File[],
  bucketName: string = 'property-files',
  tags: string[] = [],
  onFileProgress?: (index: number, progress: number) => void
): Promise<string[]> => {
  try {
    // Upload each file sequentially
    const urls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], bucketName, tags,
        (progress) => onFileProgress?.(i, progress));
      urls.push(url);
    }
    
    return urls;
  } catch (error) {
    console.error('Error in uploadMultipleFiles:', error);
    throw error;
  }
};

// Helper function to extract tags from FileWithPreview objects
export const extractTags = (files: FileWithPreview[]): string[] => {
  const allTags = new Set<string>();
  files.forEach(file => {
    file.tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags);
};
