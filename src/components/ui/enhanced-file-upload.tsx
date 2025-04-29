import React, { useState, useRef, useCallback, useEffect } from "react";
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
  setUploadedFiles?: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  allowUrlUpload?: boolean;
  roomOptions?: RoomTagOption[];
  maxConcurrentUploads?: number;
  autoUpload?: boolean;
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
  maxConcurrentUploads = 5,
  autoUpload = false
}: EnhancedFileUploadProps) {
  const [internalUploadedFiles, internalSetUploadedFiles] = useState<FileWithPreview[]>([]);
  const files = uploadedFiles || internalUploadedFiles;
  const setFiles = setUploadedFiles || internalSetUploadedFiles;

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [activeUploads, setActiveUploads] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

const processFiles = async (fileList: FileList) => {
  console.log(`Processing ${fileList.length} files`);
  if (!fileList.length) return;
  
  const newFiles: FileWithPreview[] = [];
  const newFileIds: string[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const previewUrl = await createPreviewUrl(file);
    const fileId = `${Date.now()}-${i}`; // Fine to create new ids here

    const newFile: FileWithPreview = {
      id: fileId,
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
    newFileIds.push(fileId);
  }

  // ✅ Correctly append new files to uploadedFiles
  if (setUploadedFiles) {
    setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
    console.log(`Added ${newFiles.length} files to uploadedFiles state`);
  }

  // ✅ Queue them for upload
  setUploadQueue(prevQueue => [...prevQueue, ...newFileIds]);
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    if (e.target) e.target.value = '';
  };

  const processUploadQueue = useCallback(async () => {
    if (uploadQueue.length === 0) return;

    const availableSlots = maxConcurrentUploads - activeUploads;
    if (availableSlots <= 0) return;

    const filesToUpload = uploadQueue.slice(0, availableSlots);
    const remainingQueueIds = uploadQueue.slice(availableSlots);

    setUploadQueue(remainingQueueIds);

    filesToUpload.forEach(async (fileId) => {
      const fileToUpload = files.find(f => f.id === fileId && f.status === 'ready');
      if (!fileToUpload) return;

      setActiveUploads(prev => prev + 1);
      setIsUploading(true);

      try {
        setFiles(prev =>
          prev.map(file =>
            file.id === fileToUpload.id ? { ...file, status: 'uploading' } : file
          )
        );

        await uploadFile(fileToUpload);
      } catch (error) {
        console.error(error);
      } finally {
        setActiveUploads(prev => Math.max(0, prev - 1));
      }
    });
  }, [uploadQueue, files, activeUploads, maxConcurrentUploads, setFiles]);

  const uploadFile = async (fileToUpload: FileWithPreview) => {
    if (!fileToUpload.file) return;

    try {
      const fileExt = fileToUpload.name.split('.').pop();
      const filePath = `${Math.random()}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('property-files')
        .upload(filePath, fileToUpload.file, { cacheControl: '3600' });

      if (error) throw error;

      const { data } = supabase.storage.from('property-files').getPublicUrl(filePath);

      setFiles(prev =>
        prev.map(file =>
          file.id === fileToUpload.id
            ? { ...file, url: data.publicUrl, progress: 100, status: 'complete' }
            : file
        )
      );
    } catch (error) {
      console.error('Upload error', error);
      setFiles(prev =>
        prev.map(file =>
          file.id === fileToUpload.id ? { ...file, status: 'error' } : file
        )
      );
    }
  };

  useEffect(() => {
    if (uploadQueue.length > 0 && activeUploads < maxConcurrentUploads) {
      processUploadQueue();
    }
  }, [uploadQueue, activeUploads, processUploadQueue, maxConcurrentUploads]);

  useEffect(() => {
    if (activeUploads === 0 && uploadQueue.length === 0 && isUploading) {
      setIsUploading(false);
      const completed = files.filter(f => f.status === 'complete');
      if (completed.length > 0 && onUploadComplete) {
        onUploadComplete(completed);
      }
    }
  }, [activeUploads, uploadQueue, isUploading, files, onUploadComplete]);

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
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-lg font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <p className="text-sm text-gray-500">
          Drag & Drop or{" "}
          <span className="text-blue-600 hover:underline">Choose file{multiple ? 's' : ''}</span>
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

      {files.length > 0 && (
        <div className="space-y-3 mt-6">
          {files.map(file => (
            <div key={file.id} className="flex items-center justify-between border p-4 rounded-md">
              <div className="flex items-center gap-4">
                {file.previewUrl && (
                  <img src={file.previewUrl} alt={file.name} className="w-12 h-12 object-cover rounded" />
                )}
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.size}</p>
                  {file.status === 'uploading' && <Progress value={file.progress} className="h-2 mt-1" />}
                </div>
              </div>
              <div>
                {file.status === 'uploading' && <XCircle className="h-5 w-5 text-gray-400" />}
                {file.status === 'complete' && <Badge variant="outline">Uploaded</Badge>}
                {file.status === 'error' && <Badge variant="destructive">Error</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
