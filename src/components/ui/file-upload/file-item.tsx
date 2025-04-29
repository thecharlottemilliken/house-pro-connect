
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import { FileWithPreview } from "./types";
import { FileThumbnail } from "./file-thumbnail";
import { FileTags } from "./file-tags";

interface FileItemProps {
  file: FileWithPreview;
  onRemove: (fileId: string) => void;
  onAddTag: (fileId: string, tag: string) => void;
  onRemoveTag: (fileId: string, tag: string) => void;
}

export function FileItem({ file, onRemove, onAddTag, onRemoveTag }: FileItemProps) {
  return (
    <div className="border rounded-lg p-4 flex items-center gap-4">
      <FileThumbnail file={file} />

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
              onRemove(file.id);
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

        <FileTags 
          file={file} 
          onAddTag={(tag) => onAddTag(file.id, tag)} 
          onRemoveTag={(tag) => onRemoveTag(file.id, tag)} 
        />
      </div>
    </div>
  );
}
