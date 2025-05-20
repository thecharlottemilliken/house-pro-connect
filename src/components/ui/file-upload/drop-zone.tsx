
import React, { useState, useCallback } from "react";
import { Upload } from "lucide-react";

interface DropZoneProps {
  label: string;
  description: string;
  onDrop: (files: FileList) => void;
  onClick: () => void;
  disabled?: boolean;
}

export function DropZone({ 
  label, 
  description, 
  onDrop, 
  onClick,
  disabled = false
}: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) e.dataTransfer.dropEffect = "copy";
  }, [disabled]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onDrop(e.dataTransfer.files);
      }
    },
    [onDrop, disabled]
  );

  const opacityClass = disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer";

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
        isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
      } ${opacityClass}`}
    >
      <Upload className="h-10 w-10 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-500 mt-1 text-center">{description}</p>
      {disabled && (
        <p className="text-sm text-gray-400 mt-2 animate-pulse">Processing, please wait...</p>
      )}
    </div>
  );
}
