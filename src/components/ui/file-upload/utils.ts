
import { FileWithPreview } from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * Formats a file size into a human-readable string
 */
export const formatFileSize = (bytes: number | string): string => {
  if (typeof bytes === 'string') {
    bytes = parseInt(bytes);
  }
  
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Creates a preview URL for a file
 */
export const createPreviewUrl = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Updates the status of a file
 */
export const updateFileStatus = (
  file: FileWithPreview, 
  status: 'uploading' | 'complete' | 'error',
  errorMessage?: string
): FileWithPreview => {
  return {
    ...file,
    status,
    errorMessage,
    progress: status === 'complete' ? 100 : file.progress
  };
};

/**
 * Extract valid URLs from FileWithPreview objects
 */
export const extractUrls = (files: FileWithPreview[]): string[] => {
  if (!files || !Array.isArray(files)) return [];
  
  // Get only completed files with urls
  const validFiles = files.filter(file => 
    file.status === 'complete' && 
    (file.url || file.previewUrl)
  );
  
  // Extract URLs, prioritizing the permanent URL over the preview URL
  const urls = validFiles.map(file => file.url || file.previewUrl || '').filter(url => !!url);
  
  return urls;
};

/**
 * Create FileWithPreview objects from URLs
 */
export const createFilesFromUrls = (urls: string[]): FileWithPreview[] => {
  if (!urls || !Array.isArray(urls)) return [];
  
  return urls.map(url => ({
    id: uuidv4(),
    name: url.split('/').pop() || 'image',
    size: 0,
    type: 'image/jpeg',
    previewUrl: url,
    url: url,
    progress: 100,
    status: 'complete',
    tags: ['before']
  }));
};
