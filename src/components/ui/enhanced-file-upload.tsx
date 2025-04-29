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
  const [isAddingTag, setIsAddingTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [activeUploads, setActiveUploads] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

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

  const processFiles = async (filesList: FileList) => {
    const newFiles: FileWithPreview[] = [];
    const newFileIds: string[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const previewUrl = await createPreviewUrl(file);
      const fileId = `${Date.now()}-${i}`;
      newFiles.push({
        id: fileId,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        progress: 0,
        tags: [],
        previewUrl,
        status: 'ready'
      });
      newFileIds.push(fileId);
    }
    setFiles(prev => [...prev, ...newFiles]);
    setUploadQueue(prevQueue => [...prevQueue, ...newFileIds]);
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
        setFiles(prevFiles =>
          prevFiles.map(file =>
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

  useEffect(() => {
    if (activeUploads === 0 && uploadQueue.length === 0 && isUploading) {
      setIsUploading(false);
      const completed = files.filter(f => f.status === 'complete');
      if (completed.length > 0 && onUploadComplete) {
        onUploadComplete(completed);
      }
    }
  }, [activeUploads, uploadQueue, isUploading, files, onUploadComplete]);

  useEffect(() => {
    if (uploadQueue.length > 0 && activeUploads < maxConcurrentUploads) {
      processUploadQueue();
    }
  }, [uploadQueue, activeUploads, processUploadQueue, maxConcurrentUploads]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    if (e.target) e.target.value = '';
  };

  // 🔥 Replace all other instances of uploadedFiles/setUploadedFiles with files/setFiles throughout the UI rendering logic
  // ... this includes map, removeFile, addTag, etc.

  // (Rendering logic continues here — unchanged, just ensure you're referencing `files` instead of `uploadedFiles`)
}
