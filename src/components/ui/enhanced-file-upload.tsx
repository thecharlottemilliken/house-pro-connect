
import React, { useState, useRef, useEffect } from "react";
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
  size: string | number;
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
};

interface EnhancedFileUploadProps {
  accept?: string;
  multiple?: boolean;
  onUploadComplete?: (files: FileWithPreview[]) => void;
  label: string;
  description: string;
  uploadedFiles: FileWithPreview[];
  setUploadedFiles: (files: FileWithPreview[]) => void;
  allowUrlUpload?: boolean;
  roomOptions?: RoomTagOption[];
}

export function EnhancedFileUpload({
  accept = "image/*,application/pdf",
  multiple = true,
  onUploadComplete,
  label,
  description,
  uploadedFiles,
  setUploadedFiles,
  allowUrlUpload = false,
  roomOptions = [],
}: EnhancedFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isAddingTag, setIsAddingTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Focus on tag input when adding a new tag
  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const createPreviewUrl = (file: File): Promise<string | undefined> => {
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
  };

  const processFiles = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    const newFiles: FileWithPreview[] = [];

    console.log(`Processing ${files.length} files`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = await createPreviewUrl(file);
      const formattedSize = typeof file.size === 'number' ? formatFileSize(file.size) : file.size;

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

    console.log(`Adding ${newFiles.length} files to upload queue`);
    
    // Update state with new files
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Start uploading these files
    for (const fileWithPreview of newFiles) {
      await uploadFile(fileWithPreview);
    }
    
    setIsUploading(false);
  };

  const uploadFile = async (fileWithPreview: FileWithPreview) => {
    if (!fileWithPreview.file || !fileWithPreview.id) {
      console.error("Cannot upload file - missing file or ID");
      return;
    }

    try {
      // Mark file as uploading
      updateFileStatus(fileWithPreview.id, "uploading", 0);

      // Generate a unique file path
      const timestamp = Date.now();
      const fileExt = fileWithPreview.file.name.split('.').pop();
      const filePath = `${timestamp}-${fileWithPreview.file.name}`;
      
      console.log(`Uploading file: ${filePath}`);

      const { data, error } = await supabase.storage
        .from('properties')
        .upload(filePath, fileWithPreview.file, {
          upsert: true,
          contentType: fileWithPreview.file.type,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            updateFileStatus(fileWithPreview.id, "uploading", percent);
          }
        });

      if (error) {
        console.error("Upload error:", error);
        updateFileStatus(fileWithPreview.id, "error");
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(data.path);

      // Update file with URL and complete status
      updateFileStatus(fileWithPreview.id, "complete", 100, publicUrl);
      
      console.log(`Upload complete: ${publicUrl}`);

      // Notify parent component of completed upload
      if (onUploadComplete) {
        // Find all completed files
        const completedFiles = uploadedFiles.filter(f => f.status === "complete");
        onUploadComplete(completedFiles);
      }
    } catch (error: any) {
      console.error("Upload exception:", error);
      updateFileStatus(fileWithPreview.id, "error");
      toast({
        title: "Upload error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateFileStatus = (
    fileId: string,
    status: FileWithPreview["status"],
    progress: number = 0,
    url?: string
  ) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            status,
            progress,
            url: url || file.url,
          };
        }
        return file;
      })
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    const updatedFiles = uploadedFiles.filter((file) => file.id !== fileId);
    setUploadedFiles(updatedFiles);

    toast({
      title: "File removed",
      description: `${fileToRemove?.name || "File"} has been removed`,
    });
  };

  const addTag = (fileId: string) => {
    if (!newTag.trim()) {
      setIsAddingTag(null);
      return;
    }

    setUploadedFiles((prevFiles) =>
      prevFiles.map((file) => {
        if (file.id === fileId) {
          const updatedTags = file.tags.includes(newTag) ? file.tags : [...file.tags, newTag];
          return { ...file, tags: updatedTags };
        }
        return file;
      })
    );

    setNewTag("");
    setIsAddingTag(null);
  };

  const removeTag = (fileId: string, tag: string) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.map((file) => {
        if (file.id === fileId) {
          return { ...file, tags: file.tags.filter((t) => t !== tag) };
        }
        return file;
      })
    );
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
        <p className="text-sm text-gray-500">{description}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {uploadedFiles.length} File{uploadedFiles.length !== 1 ? "s" : ""}
            </h3>
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
                    <div
                      className={cn(
                        "w-full h-full flex items-center justify-center rounded text-white font-bold",
                        file.type.includes("pdf") ? "bg-red-500" : "bg-blue-500"
                      )}
                    >
                      {file.type.includes("pdf")
                        ? "PDF"
                        : file.type.split("/")[1]?.toUpperCase().substring(0, 3) || "?"}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{file.size}</p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <Trash2 className="h-5 w-5 text-gray-500" />
                    </Button>
                  </div>

                  {file.status === "uploading" && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{file.progress}% complete</p>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {file.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="flex items-center gap-1 bg-gray-100"
                      >
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
                    ))}

                    {isAddingTag === file.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          addTag(file.id);
                        }}
                        className="flex items-center"
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
