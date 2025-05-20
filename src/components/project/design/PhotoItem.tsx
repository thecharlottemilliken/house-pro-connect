import React from 'react';
import { X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoItemProps {
  photo: string;
  index: number;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ photo, index, onRemove, onReorder }) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(index);
  };
  
  // We could add drag-and-drop functionality here for reordering
  // but for now we'll keep it simple
  
  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden">
      <img 
        src={photo} 
        alt={`Photo ${index + 1}`} 
        className="w-full h-full object-cover" 
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
          console.error("Failed to load image:", photo);
        }}
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
        <Button 
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <GripVertical className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(PhotoItem);
