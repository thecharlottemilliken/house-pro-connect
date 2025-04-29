
import React from "react";
import { FileWithPreview, RoomTagOption } from "./types";
import { FileItem } from "./file-item";

interface FilesListProps {
  files: FileWithPreview[];
  onRemoveFile: (fileId: string) => void;
  onAddTag: (fileId: string, tag: string) => void;
  onRemoveTag: (fileId: string, tag: string) => void;
  roomOptions: RoomTagOption[];
}

export function FilesList({ files, onRemoveFile, onAddTag, onRemoveTag, roomOptions }: FilesListProps) {
  if (files.length === 0) return null;
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {files.length} File{files.length !== 1 ? "s" : ""}
        </h3>
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <FileItem 
            key={file.id} 
            file={file} 
            onRemove={onRemoveFile} 
            onAddTag={onAddTag} 
            onRemoveTag={onRemoveTag} 
            roomOptions={roomOptions}
          />
        ))}
      </div>
    </div>
  );
}
