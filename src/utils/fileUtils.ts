
import { FileWithPreview } from "@/components/ui/file-upload";

// Helper function to convert string URLs to FileWithPreview objects
export const convertUrlsToFileObjects = (urls: string[]): FileWithPreview[] => {
  if (!urls || !Array.isArray(urls)) return [];
  
  return urls.map(url => ({
    id: url,
    name: url.split('/').pop() || 'file',
    size: '0',
    type: 'image/jpeg',
    url,
    progress: 100,
    tags: [],
    status: 'complete'
  }));
};

// Helper function to filter out invalid URLs
export const filterValidUrls = (urls: string[] | undefined): string[] => {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.filter(url => url && typeof url === 'string' && !url.startsWith('blob:'));
};
