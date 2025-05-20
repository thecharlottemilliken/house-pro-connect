
import React, { useMemo, useEffect } from 'react';
import PhotoGrid from "./PhotoGrid";
import EmptyPhotoState from "./EmptyPhotoState";
import PhotoControls from "./PhotoControls";

interface BeforePhotosSectionProps {
  area: string;
  beforePhotos: string[];
  propertyPhotos: string[];
  propertyId?: string; // Added propertyId prop
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
  onRemovePhoto: (index: number) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
}

const BeforePhotosSection: React.FC<BeforePhotosSectionProps> = ({
  area,
  beforePhotos,
  propertyPhotos,
  propertyId, // Accept propertyId to pass to child components
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  onRemovePhoto,
  onReorderPhotos
}) => {
  const hasBeforePhotos = useMemo(() => {
    // Additional check to ensure we don't have empty strings, blob URLs, or null/undefined values
    const validPhotos = beforePhotos?.filter(photo => 
      photo && 
      typeof photo === 'string' && 
      !photo.startsWith('blob:')
    ) || [];
    return validPhotos.length > 0;
  }, [beforePhotos]);

  // Debug logging for beforePhotos
  useEffect(() => {
    console.log('BeforePhotosSection - area:', area); 
    console.log('BeforePhotosSection - beforePhotos:', beforePhotos);
    console.log('BeforePhotosSection - hasBeforePhotos:', hasBeforePhotos);
    console.log('BeforePhotosSection - propertyId:', propertyId);
    
    // Detailed analysis of photos
    if (beforePhotos && beforePhotos.length > 0) {
      beforePhotos.forEach((url, index) => {
        console.log(`Photo ${index}: ${url} (${typeof url}, valid: ${Boolean(url && typeof url === 'string' && !url.startsWith('blob:'))})`);
      });
    }
  }, [area, beforePhotos, hasBeforePhotos, propertyId]);

  if (!hasBeforePhotos) {
    return (
      <EmptyPhotoState 
        area={area}
        propertyPhotos={propertyPhotos}
        propertyId={propertyId}
        onSelectBeforePhotos={onSelectBeforePhotos}
        onUploadBeforePhotos={onUploadBeforePhotos}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PhotoGrid 
        photos={beforePhotos.filter(url => url && typeof url === 'string' && !url.startsWith('blob:'))} 
        onRemovePhoto={onRemovePhoto} 
        onReorderPhotos={onReorderPhotos} 
      />
      
      <PhotoControls 
        area={area}
        propertyPhotos={propertyPhotos}
        propertyId={propertyId}
        onSelectBeforePhotos={onSelectBeforePhotos}
        onUploadBeforePhotos={onUploadBeforePhotos}
      />
    </div>
  );
};

export default React.memo(BeforePhotosSection);
