
// Only updating the affected function to fix the metadata property
export const uploadFileToStorage = async (
  bucket: string,
  path: string,
  file: File,
  options: FileOptions = {}
): Promise<FileUploadResult> => {
  try {
    // Fix the metadata property name
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
        metadata: options.metadata || {} // Changed from fileMetadata to metadata
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    
    return {
      path,
      publicUrl,
      size: file.size,
      contentType: file.type,
      metadata: options.metadata || {}
    };
  } catch (error: any) {
    console.error('Unexpected error during file upload:', error);
    return { error: error.message || 'Unknown error during upload' };
  }
};
