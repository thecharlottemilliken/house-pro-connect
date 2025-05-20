import React from "react";
import { X } from "lucide-react";
import { FileWithPreview, RoomTagOption } from "./types";
import { FileThumbnail } from "./file-thumbnail";
import { FileTags } from "./file-tags";
import { formatFileSize } from "./utils";
import { Button } from "@/components/ui/button";

interface FileItemProps {
  file: FileWithPreview;
  onRemove: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  roomOptions?: RoomTagOption[];
  disabled?: boolean; // Add the disabled property
}

export const FileItem = ({
  file,
  onRemove,
  onAddTag,
  onRemoveTag,
  roomOptions = [],
  disabled = false, // Set default value
}: FileItemProps) => {
  // Determine status indicator
  let statusIndicator = null;
  if (file.status === 'uploading') {
    statusIndicator = <span className="text-xs text-gray-500">Uploading...</span>;
  } else if (file.status === 'complete') {
    statusIndicator = <span className="text-xs text-green-500">Complete</span>;
  } else if (file.status === 'error') {
    statusIndicator = <span className="text-xs text-red-500">Error</span>;
  }
  
  // Determine if there's an error message to display
  let errorMessage = null;
  if (file.status === 'error' && file.errorMessage) {
    errorMessage = <p className="text-xs text-red-500 mt-1">{file.errorMessage}</p>;
  }
  
  return (
    <div className="relative flex items-center p-2 rounded-md border border-border bg-background">
      <FileThumbnail file={file} />
      
      <div className="flex-1 ml-3 overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {typeof file.size === 'number' 
                ? formatFileSize(file.size) 
                : file.size || 'Unknown size'}
            </p>
          </div>
          
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onRemove}
              aria-label="Remove file"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {roomOptions.length > 0 && (
          <FileTags
            tags={file.tags || []}
            options={roomOptions}
            onAddTag={disabled ? undefined : onAddTag}
            onRemoveTag={disabled ? undefined : onRemoveTag}
          />
        )}
        
        {file.status === 'uploading' && (
          <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{ width: `${file.progress}%` }}
            ></div>
          </div>
        )}
        
        {file.status === 'error' && file.errorMessage && (
          <p className="text-xs text-red-500 mt-1">{file.errorMessage}</p>
        )}
      </div>
    </div>
  );
};
