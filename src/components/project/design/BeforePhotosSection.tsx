
import React, { useMemo, useEffect, useState } from 'react';
import PhotoGrid from "./PhotoGrid";
import EmptyPhotoState from "./EmptyPhotoState";
import PhotoControls from "./PhotoControls";
import { filterValidPhotoUrls } from '@/utils/BeforePhotosService';

interface BeforePhotosSectionProps {
  area: string;
  beforePhotos: string[];
  propertyPhotos: string[];
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
  onRemovePhoto: (index: number) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
}

const BeforePhotosSection: React.FC<BeforePhotosSectionProps> = ({
  area,
  beforePhotos,
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  onRemovePhoto,
  onReorderPhotos
}) => {
  // Local state to track photos while updates are in progress
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get valid photos for display
  const validPhotos = useMemo(() => {
    return filterValidPhotoUrls(beforePhotos);
  }, [beforePhotos]);

  const hasBeforePhotos = validPhotos.length > 0;

  // Enhanced handlers with loading states
  const handleSelectPhotos = async (photos: string[]) => {
    setIsUpdating(true);
    try {
      await onSelectBeforePhotos(photos);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadPhotos = async (photos: string[]) => {
    setIsUpdating(true);
    try {
      await onUploadBeforePhotos(photos);
    } finally {
      setIsUpdating(false);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('BeforePhotosSection - area:', area); 
    console.log('BeforePhotosSection - beforePhotos:', beforePhotos);
    console.log('BeforePhotosSection - valid photos count:', validPhotos.length);
  }, [area, beforePhotos, validPhotos]);

  if (!hasBeforePhotos) {
    return (
      <EmptyPhotoState 
        area={area}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={handleSelectPhotos}
        onUploadBeforePhotos={handleUploadPhotos}
        isLoading={isUpdating}
      />
    );
  }

  return (
    <div className="space-y-6">
      {isUpdating && (
        <div className="py-2 text-sm text-gray-500 animate-pulse">
          Updating photos...
        </div>
      )}
      
      <PhotoGrid 
        photos={validPhotos} 
        onRemovePhoto={onRemovePhoto} 
        onReorderPhotos={onReorderPhotos} 
      />
      
      <PhotoControls 
        area={area}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={handleSelectPhotos}
        onUploadBeforePhotos={handleUploadPhotos}
        disabled={isUpdating}
      />
    </div>
  );
};

export default React.memo(BeforePhotosSection);
