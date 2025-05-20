import { v4 as uuidv4 } from 'uuid';
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
 * Creates a preview URL for a file
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Helper function to extract URLs from FileWithPreview objects
export const extractUrls = (files: FileWithPreview[]): string[] => {
  if (!files || !Array.isArray(files)) {
    return [];
  }
  
  return files
    .filter(file => file.status === 'complete' && file.url)
    .map(file => file.url as string);
};

// Helper function to create FileWithPreview objects from string URLs
export const createFilesFromUrls = (urls: string[]): FileWithPreview[] => {
  if (!urls || !Array.isArray(urls)) {
    return [];
  }
  
  return urls.map(url => ({
    id: url,
    name: url.split('/').pop() || 'file',
    size: '0',
    type: url.includes('.pdf') ? 'application/pdf' : 'image/jpeg',
    url,
    progress: 100,
    status: 'complete' as const,
    tags: []
  }));
};

// Update existing function
export const updateFileStatus = (
  file: FileWithPreview,
  status: 'uploading' | 'complete' | 'error',
  errorMessage?: string
): FileWithPreview => {
  return {
    ...file,
    status,
    ...(errorMessage && { errorMessage })
  };
};
