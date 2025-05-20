
import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";
import PhotoItem from './PhotoItem';
import { filterValidPhotoUrls } from '@/utils/BeforePhotosService';

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
  // Filter out any invalid photo URLs
  const validPhotos = useMemo(() => {
    return filterValidPhotoUrls(photos);
  }, [photos]);
  
  if (!validPhotos || validPhotos.length === 0) {
    return null;
  }

  // Different layouts based on photo count
  const getGridLayout = () => {
    if (validPhotos.length === 1) {
      return "grid-cols-1";
    } else if (validPhotos.length <= 3) {
      return "grid-cols-2";
    } else {
      return "grid-cols-2 md:grid-cols-3";
    }
  };
  
  return (
    <div className={cn(`grid gap-4 ${getGridLayout()}`, className)}>
      {validPhotos.map((photo, index) => (
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
