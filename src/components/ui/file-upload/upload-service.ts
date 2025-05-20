
import { v4 as uuidv4 } from "uuid";
import { FileWithPreview } from "./types";
import { createPreviewUrl } from "./utils";
import { supabase } from "@/integrations/supabase/client";

// Define the missing types
export interface FileOptions {
  metadata?: Record<string, any>;
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export interface FileUploadResult {
  path?: string;
  publicUrl?: string;
  size?: number | string;
  contentType?: string;
  metadata?: Record<string, any>;
  error?: string;
}

// Only updating the affected function to fix the metadata property
export const uploadFileToStorage = async (
  bucket: string,
  path: string,
  file: File,
  options: FileOptions = {}
): Promise<FileUploadResult> => {
  try {
    // Fix the metadata property name
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
        metadata: options.metadata || {} // Changed from fileMetadata to metadata
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    
    return {
      path,
      publicUrl,
      size: file.size,
      contentType: file.type,
      metadata: options.metadata || {}
    };
  } catch (error: any) {
    console.error('Unexpected error during file upload:', error);
    return { error: error.message || 'Unknown error during upload' };
  }
};

// Add missing exports that were referenced elsewhere
export const extractTags = (tags: string[] = []): Record<string, string> => {
  const metadata: Record<string, string> = {};
  
  if (tags && tags.length > 0) {
    tags.forEach((tag, index) => {
      metadata[`tag_${index}`] = tag;
    });
    metadata['tag_count'] = tags.length.toString();
  }
  
  return metadata;
};

export const uploadFile = async (
  file: File, 
  bucket: string = 'property-files',
  tags: string[] = []
): Promise<string> => {
  try {
    // Create a unique path for this file
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    
    // Extract tags to metadata
    const metadata = extractTags(tags);
    
    // Upload to Supabase storage
    const result = await uploadFileToStorage(bucket, filePath, file, { metadata });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.publicUrl || '';
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadMultipleFiles = async (
  files: File[], 
  bucket: string = 'property-files',
  tags: string[] = []
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, bucket, tags));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

export const processFiles = async (files: FileList, initialTags: string[] = []): Promise<FileWithPreview[]> => {
  const processedFiles: FileWithPreview[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const id = uuidv4();
    const previewUrl = await createPreviewUrl(file);
    
    processedFiles.push({
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
      progress: 0,
      tags: [...initialTags], // Apply initial tags to all files
      status: 'ready'
    });
  }
  
  return processedFiles;
};
