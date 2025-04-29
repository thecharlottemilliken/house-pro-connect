
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "./types";
import { createPreviewUrl, updateFileStatus } from "./utils";

/**
 * Process files selected for upload
 */
export async function processFiles(
  files: FileList,
  existingFiles: FileWithPreview[]
): Promise<FileWithPreview[]> {
  if (!files.length) return [];

  const newFiles: FileWithPreview[] = [];

  console.log(`Processing ${files.length} files`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const previewUrl = await createPreviewUrl(file);
    const formattedSize = typeof file.size === "number" 
      ? formatFileSize(file.size) 
      : file.size;

    newFiles.push({
      id: `${Date.now()}-${i}`,
      file,
      name: file.name,
      size: formattedSize,
      type: file.type,
      progress: 0,
      tags: [],
      previewUrl,
      status: "ready",
    });
  }

  console.log(`Added ${newFiles.length} files to upload queue`);
  return newFiles;
}

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
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  fileWithPreview: FileWithPreview,
  updateFileStatusCallback: (
    fileId: string,
    status: FileWithPreview["status"],
    progress?: number,
    url?: string
  ) => void
): Promise<FileWithPreview | null> {
  if (!fileWithPreview.file || !fileWithPreview.id) {
    console.error("Cannot upload file - missing file or ID");
    return null;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.error("Authentication required for file uploads");
    updateFileStatusCallback(fileWithPreview.id, "error");
    return null;
  }

  try {
    // Mark file as uploading
    updateFileStatusCallback(fileWithPreview.id, "uploading", 0);

    // Generate a unique file path
    const timestamp = Date.now();
    const filePath = `${timestamp}-${fileWithPreview.file.name}`;
    
    console.log(`Uploading file: ${filePath}`);

    const { data, error } = await supabase.storage
      .from('properties')
      .upload(filePath, fileWithPreview.file, {
        upsert: true,
        contentType: fileWithPreview.file.type,
      });

    if (error) {
      console.error("Upload error:", error);
      updateFileStatusCallback(fileWithPreview.id, "error");
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(data.path);

    // Update file with URL and complete status
    updateFileStatusCallback(fileWithPreview.id, "complete", 100, publicUrl);
    
    console.log(`Upload complete: ${publicUrl}`);

    return {
      ...fileWithPreview,
      status: "complete",
      progress: 100,
      url: publicUrl
    };
  } catch (error: any) {
    console.error("Upload exception:", error);
    updateFileStatusCallback(fileWithPreview.id, "error");
    return null;
  }
}
