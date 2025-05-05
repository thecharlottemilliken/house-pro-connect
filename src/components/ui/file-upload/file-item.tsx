
import React, { useState } from "react";
import { X, Tag, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileWithPreview, RoomTagOption } from "./types";
import { FileThumbnail } from "./file-thumbnail";
import { FileTags } from "./file-tags";
import { formatFileSize } from "./utils";

interface FileItemProps {
  file: FileWithPreview;
  onRemove: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  availableTags?: RoomTagOption[];
}

export function FileItem({
  file,
  onRemove,
  onAddTag,
  onRemoveTag,
  availableTags = []
}: FileItemProps) {
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");

  const handleAddTag = () => {
    if (selectedTag) {
      onAddTag(selectedTag);
      setSelectedTag("");
      setShowTagInput(false);
    }
  };

  // Convert file.size to number if it's a string
  const fileProgress = typeof file.progress === 'number' ? file.progress : 0;

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg relative">
      <FileThumbnail file={file} className="w-10 h-10" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm text-gray-700 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(typeof file.size === 'string' ? 0 : file.size)}</p>
          </div>
          
          {file.status === 'uploading' && (
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                style={{ width: `${fileProgress}%` }}
              />
            </div>
          )}
        </div>
        
        {/* Tags section */}
        <div className="mt-2">
          <FileTags 
            tags={file.tags} 
            onRemoveTag={onRemoveTag} 
          />
          
          {/* Add tag UI */}
          {showTagInput ? (
            <div className="flex items-center mt-2 gap-2">
              <select
                className="text-xs border rounded py-1 px-2 flex-1"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">Select a tag...</option>
                {availableTags.map((tag) => (
                  <option key={tag.value} value={tag.value}>{tag.label}</option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleAddTag}
                disabled={!selectedTag}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowTagInput(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs flex items-center gap-1 mt-1"
              onClick={() => setShowTagInput(true)}
            >
              <Plus className="h-3 w-3" />
              <Tag className="h-3 w-3 mr-1" />
              Add tag
            </Button>
          )}
        </div>
      </div>
      
      {file.status === 'uploading' ? (
        <div className="w-6 h-6 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      )}
    </div>
  );
}
