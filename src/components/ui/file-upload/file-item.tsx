
import React from "react";
import { X, Plus } from "lucide-react";
import { FileWithPreview, RoomTagOption } from "./types";
import { FileThumbnail } from "./file-thumbnail";
import { FileTags } from "./file-tags";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "./utils";
import { Progress } from "@/components/ui/progress";

interface FileItemProps {
  file: FileWithPreview;
  onRemove: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  roomOptions?: RoomTagOption[]; // Changed from roomTagOptions to roomOptions
}

export const FileItem = ({ file, onRemove, onAddTag, onRemoveTag, roomOptions = [] }: FileItemProps) => {
  return (
    <div className="flex gap-4 items-center p-2 border rounded-lg bg-white">
      <FileThumbnail file={file} />
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
        
        {file.status === 'uploading' && (
          <Progress value={file.progress} className="h-2 mt-2" />
        )}
        
        {file.status === 'error' && (
          <p className="text-sm text-red-500 mt-1">{file.errorMessage || 'Upload failed'}</p>
        )}
        
        <FileTags 
          tags={file.tags} 
          onRemoveTag={onRemoveTag}
          roomOptions={roomOptions} // Changed from roomTagOptions to roomOptions
          onAddTag={onAddTag}
        />
      </div>
    </div>
  );
};
