
// This file re-exports components from the file-upload directory
// for backward compatibility
export { 
  FileWithPreview, 
  RoomTagOption,
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
