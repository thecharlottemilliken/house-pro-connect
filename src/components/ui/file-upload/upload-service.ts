
import { FileWithPreview } from "./types";
import { createPreviewUrl } from "./utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Process files for preview and upload preparation
export const processFiles = async (
  files: FileList,
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
      tags: [],
      status: 'ready',
    };
  });
};

// Upload a single file to Supabase storage and return its URL
export const uploadFile = async (
  file: File, 
  bucketName: string = 'property-files',
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.log(`Starting upload of ${file.name} to ${bucketName} bucket`);
    
    // First, check if the bucket exists and create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createBucketError) {
        console.error(`Error creating bucket: ${createBucketError.message}`);
        throw createBucketError;
      }
    }
    
    // Create a unique file path to prevent overwrites
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const filePath = `${timestamp}-${crypto.randomUUID()}.${fileExt}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
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
    
    console.log(`Public URL generated: ${publicUrlData?.publicUrl}`);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};

// Upload multiple files and return their URLs
export const uploadMultipleFiles = async (
  files: File[],
  bucketName: string = 'property-files',
  onFileProgress?: (index: number, progress: number) => void
): Promise<string[]> => {
  try {
    // Upload each file sequentially
    const urls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], bucketName, 
        (progress) => onFileProgress?.(i, progress));
      urls.push(url);
    }
    
    return urls;
  } catch (error) {
    console.error('Error in uploadMultipleFiles:', error);
    throw error;
  }
};
