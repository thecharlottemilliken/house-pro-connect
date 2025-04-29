import React, { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "./button"; // assume you have these
import { Progress } from "./progress"; // assume you have these
import { cn } from "@/lib/utils"; // your utils

export interface FileWithPreview {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  previewUrl?: string;
  progress: number;
  status: 'uploading' | 'ready' | 'complete' | 'error';
}

interface EnhancedFileUploadProps {
  accept?: string;
  multiple?: boolean;
  label: string;
  description: string;
  uploadedFiles?: FileWithPreview[];
  setUploadedFiles?: (files: FileWithPreview[]) => void;
}

export function EnhancedFileUpload({
  accept = "image/*,application/pdf",
  multiple = true,
  label,
  description,
  uploadedFiles = [],
  setUploadedFiles,
}: EnhancedFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createPreviewUrl = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = useCallback(async (files: FileList) => {
    const newFiles: FileWithPreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = await createPreviewUrl(file);

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        previewUrl,
        progress: 0,
        status: 'ready',
      });
    }

    setUploadedFiles?.((prev) => [...prev, ...newFiles]);
  }, [setUploadedFiles]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    event.target.value = '';
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
    }
  }, [processFiles]);

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
        <div className="space-y-3">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="border rounded-md p-4 flex items-center gap-4">
              {file.previewUrl ? (
                <img src={file.previewUrl} alt={file.name} className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded">
                  {file.type.includes('pdf') ? 'PDF' : 'FILE'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold">{file.name}</span>
                <span className="text-sm text-gray-500">{file.size}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
