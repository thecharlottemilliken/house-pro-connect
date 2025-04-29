
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
 * Update a file's status in the files array
 */
export function updateFileStatus(
  files: FileWithPreview[],
  fileId: string,
  status: FileWithPreview["status"],
  progress: number = 0,
  url?: string
): FileWithPreview[] {
  return files.map((file) => {
    if (file.id === fileId) {
      return {
        ...file,
        status,
        progress,
        url: url || file.url,
      };
    }
    return file;
  });
}
