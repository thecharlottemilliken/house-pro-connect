
import React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

interface DropZoneProps {
  onDrop: (acceptedFiles: FileList) => void;
  onClick: () => void;
  label: string;
  description: string;
  disabled?: boolean; // Added disabled prop
}

export function DropZone({
  onDrop,
  onClick,
  label,
  description,
  disabled = false, // Default to enabled
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (disabled) return;
      // Convert to FileList since that's what our handlers expect
      const dataTransfer = new DataTransfer();
      acceptedFiles.forEach((file) => {
        dataTransfer.items.add(file);
      });
      onDrop(dataTransfer.files);
    },
    noClick: true, // We handle click ourselves
    disabled,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    onClick();
  };

  return (
    <div
      {...getRootProps()}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center
        ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}
      `}
    >
      <div className="flex flex-col items-center justify-center space-y-2 p-4">
        <UploadCloud className={`h-10 w-10 ${isDragActive ? "text-primary" : "text-gray-400"}`} />
        <h3 className="text-lg font-medium">{label}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400">
          Drag and drop or click to upload
        </p>
      </div>
    </div>
  );
}
