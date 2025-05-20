
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  label: string;
  description: string;
  onDrop: (files: FileList) => void;
  onClick: () => void;
}

export function DropZone({ label, description, onDrop, onClick }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onDrop(event.dataTransfer.files);
    }
  };

  return (
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
      onDrop={handleDrop}
      onClick={onClick}
    >
      <Upload className="h-10 w-10 text-gray-400 mb-2" />
      <p className="text-lg font-medium text-gray-800">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
