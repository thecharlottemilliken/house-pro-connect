
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, GripVertical } from "lucide-react";

interface PhotoItemProps {
  photo: string;
  index: number;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const PhotoItem = ({ photo, index, onRemove, onReorder }: PhotoItemProps) => {
  // Debug logging for photo URL
  console.log(`PhotoItem rendering photo at index ${index}:`, photo);

  return (
    <div 
      className="relative group rounded-lg overflow-hidden aspect-[4/3]"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', index.toString());
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        onReorder(fromIndex, index);
      }}
    >
      <img 
        src={photo} 
        alt={`Before photo ${index + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error(`Failed to load image: ${photo}`);
          // Set a fallback image or add a placeholder class
          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Error';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:text-white hover:bg-red-500/50 backdrop-blur-sm"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:text-white backdrop-blur-sm cursor-move"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PhotoItem);
