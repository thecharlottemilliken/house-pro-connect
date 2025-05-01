
// This file re-exports components from the file-upload directory
// for backward compatibility

// Re-export types using 'export type' for TypeScript isolatedModules
export type { FileWithPreview, RoomTagOption } from './file-upload/types';

// Re-export components and functions
export { 
  EnhancedFileUpload,
  FileItem,
  FileTags,
  FileThumbnail,
  processFiles,
  uploadFile,
  formatFileSize,
  createPreviewUrl,
  updateFileStatus
} from './file-upload/index';

// Re-export the original FileUpload component
import { FileUpload } from './file-upload/FileUpload';
export { FileUpload };

// Export the SelectProjectFilesDialog component
export { default as SelectProjectFilesDialog } from '../project/design/SelectProjectFilesDialog';
