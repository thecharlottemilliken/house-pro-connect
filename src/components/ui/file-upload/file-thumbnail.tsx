
import React from "react";
import { cn } from "@/lib/utils";
import { FileWithPreview } from "./types";

interface FileThumbnailProps {
  file: FileWithPreview;
  className?: string;
}

export function FileThumbnail({ file, className }: FileThumbnailProps) {
  return (
    <div className={cn("flex-shrink-0 w-12 h-12 flex items-center justify-center", className)}>
      {file.previewUrl ? (
        <img
          src={file.previewUrl}
          alt={file.name}
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center rounded text-white font-bold",
            file.type.includes("pdf") ? "bg-red-500" : "bg-blue-500"
          )}
        >
          {file.type.includes("pdf")
            ? "PDF"
            : file.type.split("/")[1]?.toUpperCase().substring(0, 3) || "?"}
        </div>
      )}
    </div>
  );
}
