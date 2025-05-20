
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PhotoItemProps {
  photo: string;
  index: number;
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onClick?: () => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ 
  photo, 
  index, 
  onRemove,
  onReorder,
  onClick
}) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    onRemove(index);
  };
  
  return (
    <div 
      className="relative overflow-hidden rounded-md border border-gray-200 shadow-sm aspect-square cursor-pointer"
      onClick={onClick}
    >
      <img 
        src={photo} 
        alt={`Photo ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
      />
      
      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white"
        onClick={handleRemove}
      >
        <X className="h-4 w-4" />
      </Button>
      
      {/* Photo number badge */}
      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
        {index + 1}
      </div>
    </div>
  );
};

export default React.memo(PhotoItem);
