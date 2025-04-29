
import React, { useState, useRef } from "react";
import { Button } from "../button";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { FileWithPreview, RoomTagOption } from "./types";
import { FileItem } from "./file-item";
import { processFiles, uploadFile } from "./upload-service";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedFileUploadProps {
  accept?: string;
  multiple?: boolean;
  onUploadComplete?: (files: FileWithPreview[]) => void;
  label: string;
  description: string;
  uploadedFiles: FileWithPreview[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await handleProcessFiles(files);
    }
    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleProcessFiles = async (files: FileList) => {
    setIsUploading(true);
    
    try {
      // Check authentication first
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You must be signed in to upload files.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      
      const newFiles = await processFiles(files, uploadedFiles);
      
      // Update state with new files
      setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Start uploading these files
      for (const fileWithPreview of newFiles) {
        const uploadedFile = await uploadFile(fileWithPreview, updateFileStatus);
        if (uploadedFile && onUploadComplete) {
          const completedFiles = uploadedFiles.filter(f => f.status === "complete");
          const updatedCompletedFiles = [...completedFiles, uploadedFile];
          onUploadComplete(updatedCompletedFiles);
        }
      }
      
      toast({
        title: "Upload Complete",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading files. Please ensure you're signed in.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const updateFileStatus = (
    fileId: string,
    status: FileWithPreview["status"],
    progress: number = 0,
    url?: string
  ) => {
    setUploadedFiles(prevFiles => 
      prevFiles.map(file => {
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

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to upload files.",
        variant: "destructive"
      });
      return;
    }

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleProcessFiles(event.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));

    toast({
      title: "File removed",
      description: `${fileToRemove?.name || "File"} has been removed`,
    });
  };

  const addTag = (fileId: string, tag: string) => {
    if (!tag.trim()) return;

    setUploadedFiles(prevFiles => 
      prevFiles.map(file => {
        if (file.id === fileId) {
          const updatedTags = file.tags.includes(tag) 
            ? file.tags 
            : [...file.tags, tag];
          return { ...file, tags: updatedTags };
        }
        return file;
      })
    );
  };

  const removeTag = (fileId: string, tag: string) => {
    setUploadedFiles(prevFiles => 
      prevFiles.map(file => {
        if (file.id === fileId) {
          return { ...file, tags: file.tags.filter(t => t !== tag) };
        }
        return file;
      })
    );
  };

  const checkAuthBeforeUpload = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to upload files.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleBoxClick = async () => {
    if (await checkAuthBeforeUpload()) {
      fileInputRef.current?.click();
    }
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
        onClick={handleBoxClick}
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
              <FileItem 
                key={file.id} 
                file={file} 
                onRemove={removeFile} 
                onAddTag={addTag} 
                onRemoveTag={removeTag} 
                roomOptions={roomOptions}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
