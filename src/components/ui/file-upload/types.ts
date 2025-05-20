
/**
 * Shared types for file upload components
 */

export interface FileWithPreview {
  id: string;
  file?: File;
  name: string;
  size: string | number;
  type: string;
  url?: string;
  progress: number;
  tags: string[];
  previewUrl?: string;
  status: 'uploading' | 'complete' | 'error' | 'ready';
  errorMessage?: string; // Add this property to support error messages
}

export type RoomTagOption = {
  value: string;
  label: string;
};
