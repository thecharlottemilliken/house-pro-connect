
import React, { useMemo, useState } from 'react';
import { cn } from "@/lib/utils";
import PhotoItem from './PhotoItem';
import { filterValidPhotoUrls } from '@/utils/BeforePhotosService';
import { Button } from "@/components/ui/button";
import { Gallery } from "lucide-react";
import PhotoGalleryDialog from './PhotoGalleryDialog';

interface PhotoGridProps {
  photos: string[];
  onRemovePhoto: (index: number) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
  className?: string;
  maxVisible?: number;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ 
  photos, 
  onRemovePhoto, 
  onReorderPhotos,
  className,
  maxVisible = 4
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);
  
  // Filter out any invalid photo URLs
  const validPhotos = useMemo(() => {
    return filterValidPhotoUrls(photos);
  }, [photos]);
  
  if (!validPhotos || validPhotos.length === 0) {
    return null;
  }

  // Create a limited set of photos for the grid view
  const visiblePhotos = validPhotos.slice(0, maxVisible);
  const hasMorePhotos = validPhotos.length > maxVisible;
  
  // Different layouts based on photo count
  const getGridLayout = () => {
    if (visiblePhotos.length === 1) {
      return "grid-cols-1";
    } else if (visiblePhotos.length <= 3) {
      return "grid-cols-2";
    } else {
      return "grid-cols-2 md:grid-cols-3";
    }
  };
  
  // Open the gallery with a specific photo
  const openGalleryWithPhoto = (index: number) => {
    setInitialPhotoIndex(index);
    setIsGalleryOpen(true);
  };
  
  return (
    <>
      <div className={cn(`grid gap-4 ${getGridLayout()}`, className)}>
        {visiblePhotos.map((photo, index) => (
          <PhotoItem 
            key={`${photo}-${index}`}
            photo={photo} 
            index={index} 
            onRemove={onRemovePhoto}
            onReorder={onReorderPhotos}
            onClick={() => openGalleryWithPhoto(index)}
          />
        ))}
        
        {/* View All Button */}
        {hasMorePhotos && (
          <div 
            className="relative cursor-pointer overflow-hidden rounded-md border border-gray-200 shadow-sm bg-gray-100 aspect-square flex flex-col items-center justify-center"
            onClick={() => setIsGalleryOpen(true)}
          >
            <Gallery size={32} className="text-gray-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              View All
            </p>
            <p className="text-xs text-gray-500">
              {validPhotos.length} Photos
            </p>
          </div>
        )}
      </div>
      
      {/* Gallery Dialog */}
      <PhotoGalleryDialog
        photos={validPhotos}
        open={isGalleryOpen} 
        onOpenChange={setIsGalleryOpen}
        initialIndex={initialPhotoIndex}
      />
    </>
  );
};

export default React.memo(PhotoGrid);
