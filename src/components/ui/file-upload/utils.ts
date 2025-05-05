
import { FileWithPreview } from "./types";

/**
 * Format file size from bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Create a preview URL for an image file
 */
export function createPreviewUrl(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Update a file's status - function overloads
 */
// Overload 1: Update a single file
export function updateFileStatus(
  file: FileWithPreview,
  status: FileWithPreview["status"],
  progress?: number,
  url?: string
): FileWithPreview;

// Overload 2: Update a file in an array
export function updateFileStatus(
  files: FileWithPreview[],
  fileId: string,
  status: FileWithPreview["status"],
  progress?: number,
  url?: string
): FileWithPreview[];

// Implementation that handles both overloads
export function updateFileStatus(
  fileOrFiles: FileWithPreview | FileWithPreview[],
  fileIdOrStatus: string | FileWithPreview["status"],
  statusOrProgress: FileWithPreview["status"] | number = 0,
  progressOrUrl: number | string = 0,
  url?: string
): FileWithPreview | FileWithPreview[] {
  // Case 1: Single file update
  if (!Array.isArray(fileOrFiles) && typeof fileIdOrStatus === "string") {
    return {
      ...fileOrFiles,
      status: fileIdOrStatus as FileWithPreview["status"],
      progress: typeof statusOrProgress === "number" ? statusOrProgress : 0,
      url: (typeof progressOrUrl === "string" ? progressOrUrl : url) || fileOrFiles.url,
    };
  }
  
  // Case 2: Array update
  if (Array.isArray(fileOrFiles) && typeof fileIdOrStatus === "string") {
    return fileOrFiles.map((file) => {
      if (file.id === fileIdOrStatus) {
        return {
          ...file,
          status: statusOrProgress as FileWithPreview["status"],
          progress: typeof progressOrUrl === "number" ? progressOrUrl : 0,
          url: url || file.url,
        };
      }
      return file;
    });
  }
  
  // Fallback (should not happen with correct types)
  if (!Array.isArray(fileOrFiles)) {
    return fileOrFiles;
  }
  return fileOrFiles;
}
