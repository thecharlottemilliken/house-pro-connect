
// This file re-exports components from the file-upload directory
// for backward compatibility

// Re-export types using 'export type' for TypeScript isolatedModules
export type { FileWithPreview, RoomTagOption } from './file-upload/types';

// Re-export components and functions
export { 
  FileUpload,  // Export the original component as FileUpload (backward compatibility)
  FileItem,
  FileTags,
  FileThumbnail,
  formatFileSize,
  createPreviewUrl,
  updateFileStatus
} from './file-upload/index';

// Export processFiles and uploadFile from upload-service
export { processFiles, uploadFile } from './file-upload/upload-service';

// Re-export the original FileUpload and EnhancedFileUpload components so both are available
export { FileUpload as OriginalFileUpload } from './file-upload/FileUpload';
export { EnhancedFileUpload } from './file-upload/enhanced-file-upload';

