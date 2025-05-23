
import React from "react";
import { FileWithPreview, RoomTagOption } from "./types";
import { FileItem } from "./file-item";

interface FilesListProps {
  files: FileWithPreview[];
  onRemoveFile: (id: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  roomOptions?: RoomTagOption[]; // Changed from roomTagOptions to roomOptions
  disabled?: boolean; // Add the disabled property which was missing
}

export const FilesList = ({
  files,
  onRemoveFile,
  onAddTag,
  onRemoveTag,
  roomOptions = [], // Changed from roomTagOptions to roomOptions
  disabled = false, // Set a default value of false
}: FilesListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onRemove={() => onRemoveFile(file.id)}
          onAddTag={(tag) => onAddTag(file.id, tag)}
          onRemoveTag={(tag) => onRemoveTag(file.id, tag)}
          roomOptions={roomOptions} // Changed from roomTagOptions to roomOptions
          disabled={disabled} // Pass the disabled prop down to FileItem
        />
      ))}
    </div>
  );
};
