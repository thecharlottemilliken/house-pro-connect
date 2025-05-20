
// This file re-exports components from the file-upload directory
// for backward compatibility

// Re-export types using 'export type' for TypeScript isolatedModules
export type { FileWithPreview, RoomTagOption } from './file-upload/types';

// Re-export components and functions
export { 
  EnhancedFileUpload as FileUpload, // Change the default export to be EnhancedFileUpload
  FileItem,
  FileTags,
  FileThumbnail,
  formatFileSize,
  createPreviewUrl,
  updateFileStatus
} from './file-upload/index';

// Export processFiles and uploadFile from upload-service
export { processFiles, uploadFile } from './file-upload/upload-service';

// Re-export the original FileUpload component as OriginalFileUpload if needed
import { FileUpload as OriginalFileUpload } from './file-upload/FileUpload';
export { OriginalFileUpload };
