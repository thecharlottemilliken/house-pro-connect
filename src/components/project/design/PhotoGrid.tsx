
import React from 'react';
import { cn } from "@/lib/utils";
import PhotoItem from './PhotoItem';

interface PhotoGridProps {
  photos: string[];
  onRemovePhoto: (index: number) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ 
  photos, 
  onRemovePhoto, 
  onReorderPhotos,
  className
}) => {
  if (photos.length === 0) return null;
  
  // Different layouts based on photo count
  const getGridLayout = () => {
    if (photos.length === 1) {
      return "grid-cols-1";
    } else if (photos.length <= 3) {
      return "grid-cols-2";
    } else {
      return "grid-cols-2";
    }
  };
  
  return (
    <div className={cn(`grid gap-4 ${getGridLayout()}`, className)}>
      {photos.map((photo, index) => (
        <PhotoItem 
          key={`${photo}-${index}`}
          photo={photo} 
          index={index} 
          onRemove={onRemovePhoto}
          onReorder={onReorderPhotos}
        />
      ))}
    </div>
  );
};

export default React.memo(PhotoGrid);
