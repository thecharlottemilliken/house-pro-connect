
import React, { useState, useRef, useCallback } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Progress } from "./progress";
import { Badge } from "./badge";
import { X, Upload, Trash2, XCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface FileWithPreview {
  id: string;
  file?: File;
  name: string;
  size: string;
  type: string;
  url?: string;
  progress: number;
  tags: string[];
  previewUrl?: string;
  status: 'uploading' | 'complete' | 'error' | 'ready';
}

export type RoomTagOption = {
  value: string;
  label: string;
}

interface EnhancedFileUploadProps {
  accept?: string;
  multiple?: boolean;
  onUploadComplete?: (files: FileWithPreview[]) => void;
  label: string;
  description: string;
  uploadedFiles?: FileWithPreview[];
  setUploadedFiles?: (files: FileWithPreview[]) => void;
  allowUrlUpload?: boolean;
  roomOptions?: RoomTagOption[];
}

export function EnhancedFileUpload({
  accept = "image/*,application/pdf",
  multiple = true,
  onUploadComplete,
  label,
  description,
  uploadedFiles = [],
  setUploadedFiles,
  allowUrlUpload = false,
  roomOptions = []
}: EnhancedFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isAddingTag, setIsAddingTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Generate human-readable file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Create a file preview for images
  const createPreviewUrl = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  // Process files selected by the user
  const processFiles = async (files: FileList) => {
    if (!files.length) return;
    
    setIsUploading(true);
    const newFiles: FileWithPreview[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = await createPreviewUrl(file);
      
      const newFile: FileWithPreview = {
        id: `${Date.now()}-${i}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        progress: 0,
        tags: [],
        previewUrl,
        status: 'ready'
      };
      
      newFiles.push(newFile);
    }
    
    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles?.(updatedFiles);
    setIsUploading(false);
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  // Handle file drop zone
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      
      if (event.dataTransfer.files) {
        processFiles(event.dataTransfer.files);
      }
    },
    [uploadedFiles, setUploadedFiles]
  );

  // Upload a file to Supabase storage
  const uploadFile = async (fileToUpload: FileWithPreview) => {
    if (!fileToUpload.file) {
      toast({
        title: "Upload failed",
        description: "File not found.",
        variant: "destructive"
      });
      return null;
    }
    
    // Update file status
    updateFileStatus(fileToUpload.id, 'uploading');
    
    try {
      const fileExt = fileToUpload.name.split('.').pop();
      const filePath = `${Math.random()}-${Date.now()}.${fileExt}`;
      
      // Set up upload with progress tracking
      const { error: uploadError, data } = await supabase.storage
        .from('property-files')
        .upload(filePath, fileToUpload.file);

      // Update progress separately using the file's progress
      let progressInterval: NodeJS.Timeout | null = null;
      let progress = 0;
      
      if (!uploadError) {
        // Simulate progress since Supabase doesn't provide real-time progress
        progressInterval = setInterval(() => {
          progress += 10;
          if (progress <= 100) {
            updateFileProgress(fileToUpload.id, progress);
          } else {
            if (progressInterval) clearInterval(progressInterval);
          }
        }, 200);
      }

      if (uploadError) throw uploadError;

      if (data) {
        // Clear the interval if it exists
        if (progressInterval) clearInterval(progressInterval);
        
        // Set progress to 100% when complete
        updateFileProgress(fileToUpload.id, 100);
        
        const { data: { publicUrl } } = supabase.storage
          .from('property-files')
          .getPublicUrl(filePath);
        
        // Update file with URL
        const updatedFile = updateFileUrl(fileToUpload.id, publicUrl);
        return updatedFile;
      }
    } catch (error) {
      console.error('Upload error:', error);
      updateFileStatus(fileToUpload.id, 'error');
      toast({
        title: "Upload failed",
        description: `Error uploading ${fileToUpload.name}`,
        variant: "destructive"
      });
    }
    
    return null;
  };

  // Upload URL function
  const uploadFromUrl = async () => {
    if (!currentUrl.trim()) {
      toast({
        title: "No URL provided",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create a placeholder file
      const fileName = currentUrl.split('/').pop() || 'downloaded-file';
      const newFile: FileWithPreview = {
        id: `url-${Date.now()}`,
        name: fileName,
        size: 'Unknown',
        type: 'application/octet-stream',
        url: currentUrl,
        progress: 100,
        tags: [],
        status: 'complete'
      };
      
      const updatedFiles = [...uploadedFiles, newFile];
      setUploadedFiles?.(updatedFiles);
      setCurrentUrl("");
      
      toast({
        title: "URL added",
        description: "URL has been added to your files"
      });
    } catch (error) {
      console.error('URL import error:', error);
      toast({
        title: "Import failed",
        description: "Failed to import from URL",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Upload all files that are in 'ready' status
  const uploadAllReadyFiles = async () => {
    const filesToUpload = uploadedFiles.filter(f => f.status === 'ready');
    
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    const uploadedFilesArray = [];
    
    for (const file of filesToUpload) {
      const uploadedFile = await uploadFile(file);
      if (uploadedFile) uploadedFilesArray.push(uploadedFile);
    }
    
    setIsUploading(false);
    
    if (uploadedFilesArray.length > 0) {
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${uploadedFilesArray.length} file(s)`
      });
      
      if (onUploadComplete) {
        onUploadComplete(uploadedFilesArray);
      }
    }
  };

  // Helper function to update file status
  const updateFileStatus = (fileId: string, status: FileWithPreview['status']) => {
    const updatedFiles = uploadedFiles.map(file => 
      file.id === fileId ? { ...file, status } : file
    );
    setUploadedFiles?.(updatedFiles);
    return updatedFiles.find(f => f.id === fileId);
  };

  // Helper function to update file progress
  const updateFileProgress = (fileId: string, progress: number) => {
    const updatedFiles = uploadedFiles.map(file => 
      file.id === fileId ? { ...file, progress } : file
    );
    setUploadedFiles?.(updatedFiles);
  };

  // Helper function to update file URL
  const updateFileUrl = (fileId: string, url: string) => {
    const updatedFiles = uploadedFiles.map(file => 
      file.id === fileId ? { ...file, url, status: 'complete' as const } : file
    );
    setUploadedFiles?.(updatedFiles);
    return updatedFiles.find(f => f.id === fileId);
  };

  // Remove a file from the list
  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    
    // If the file is currently uploading, we need to cancel the upload
    if (fileToRemove?.status === 'uploading') {
      // In a real implementation, you would abort the upload request here
      // For now, we'll just remove it from the list
    }
    
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles?.(updatedFiles);
    
    toast({
      title: "File removed",
      description: `${fileToRemove?.name || 'File'} has been removed`
    });
  };

  // Add a tag to a file
  const addTag = (fileId: string) => {
    if (!newTag.trim()) {
      setIsAddingTag(null);
      return;
    }
    
    const updatedFiles = uploadedFiles.map(file => {
      if (file.id === fileId) {
        const updatedTags = file.tags.includes(newTag) ? file.tags : [...file.tags, newTag];
        return { ...file, tags: updatedTags };
      }
      return file;
    });
    
    setUploadedFiles?.(updatedFiles);
    setNewTag("");
    setIsAddingTag(null);
  };

  // Remove a tag from a file
  const removeTag = (fileId: string, tag: string) => {
    const updatedFiles = uploadedFiles.map(file => {
      if (file.id === fileId) {
        return { ...file, tags: file.tags.filter(t => t !== tag) };
      }
      return file;
    });
    
    setUploadedFiles?.(updatedFiles);
  };

  // Add a room tag to a file
  const addRoomTag = (fileId: string, room: string) => {
    const updatedFiles = uploadedFiles.map(file => {
      if (file.id === fileId) {
        // Replace any existing room tags (from roomOptions) with the new one
        const existingRoomTags = roomOptions.map(opt => opt.value);
        const nonRoomTags = file.tags.filter(tag => !existingRoomTags.includes(tag));
        return { ...file, tags: [...nonRoomTags, room] };
      }
      return file;
    });
    
    setUploadedFiles?.(updatedFiles);
  };

  // Check if a file has room tag
  const getFileRoomTag = (file: FileWithPreview): string | null => {
    const roomValues = roomOptions.map(opt => opt.value);
    const roomTag = file.tags.find(tag => roomValues.includes(tag));
    return roomTag || null;
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-lg font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <p className="text-sm text-gray-500">
          Drag & Drop or{" "}
          <span className="text-blue-600 hover:underline">Choose file</span>
          {" "}to upload
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {allowUrlUpload && (
        <>
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <p className="mx-4 text-sm text-gray-500">OR</p>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter file URL"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={uploadFromUrl} 
              disabled={isUploading || !currentUrl.trim()}
            >
              Import
            </Button>
          </div>
        </>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{uploadedFiles.length} File Upload{uploadedFiles.length !== 1 ? 's' : ''}</h3>
            {uploadedFiles.some(f => f.status === 'ready') && (
              <Button 
                onClick={uploadAllReadyFiles}
                disabled={isUploading}
              >
                Upload All
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {file.previewUrl ? (
                    <img 
                      src={file.previewUrl} 
                      alt={file.name} 
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className={cn(
                      "w-full h-full flex items-center justify-center rounded text-white font-bold",
                      file.type.includes('pdf') ? "bg-red-500" : "bg-blue-500"
                    )}>
                      {file.type.includes('pdf') ? 'PDF' : file.type.split('/')[1]?.toUpperCase().substring(0, 3) || '?'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{file.size}</p>
                    </div>

                    {file.status !== 'uploading' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 className="h-5 w-5 text-gray-500" />
                      </Button>
                    )}

                    {file.status === 'uploading' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                      >
                        <XCircle className="h-5 w-5 text-gray-500" />
                      </Button>
                    )}
                  </div>

                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{file.progress}% complete</p>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {/* Room tag dropdown if room options provided */}
                    {roomOptions.length > 0 && (
                      <div className="relative inline-block">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 h-auto text-xs",
                            getFileRoomTag(file) ? "bg-blue-100 border-blue-300 text-blue-800" : ""
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <span>{getFileRoomTag(file) 
                            ? roomOptions.find(o => o.value === getFileRoomTag(file))?.label
                            : "Select room"}
                          </span>
                          <select
                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            value={getFileRoomTag(file) || ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                addRoomTag(file.id, e.target.value);
                              }
                            }}
                          >
                            <option value="">Select room</option>
                            {roomOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </Button>
                      </div>
                    )}
                    
                    {/* Custom tags */}
                    {file.tags
                      .filter(tag => !roomOptions.map(o => o.value).includes(tag))
                      .map(tag => (
                        <Badge key={tag} variant="outline" className="flex items-center gap-1 bg-gray-100">
                          {tag}
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTag(file.id, tag);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    }
                    
                    {isAddingTag === file.id ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          addTag(file.id);
                        }} 
                        className="flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          ref={tagInputRef}
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Enter tag"
                          className="h-8 text-xs mr-1 w-28"
                          autoFocus
                        />
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsAddingTag(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </form>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-2 py-1 h-auto text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingTag(file.id);
                          setNewTag("");
                          setTimeout(() => tagInputRef.current?.focus(), 0);
                        }}
                      >
                        <Plus className="h-3 w-3" /> Add Tag
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
