
import React, { useMemo, useEffect } from 'react';
import PhotoGrid from "./PhotoGrid";
import EmptyPhotoState from "./EmptyPhotoState";
import PhotoControls from "./PhotoControls";

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
  const hasBeforePhotos = useMemo(() => {
    // Filter out invalid URLs (blob: URLs and empty/null values)
    const validPhotos = beforePhotos?.filter(photo => 
      photo && 
      typeof photo === 'string' && 
      !photo.startsWith('blob:')
    ) || [];
    
    return validPhotos.length > 0;
  }, [beforePhotos]);

  // Get valid photos for display
  const validPhotos = useMemo(() => {
    return (beforePhotos || []).filter(photo => 
      photo && 
      typeof photo === 'string' && 
      !photo.startsWith('blob:')
    );
  }, [beforePhotos]);

  // Debug logging for beforePhotos
  useEffect(() => {
    console.log('BeforePhotosSection - area:', area); 
    console.log('BeforePhotosSection - beforePhotos:', beforePhotos);
    console.log('BeforePhotosSection - valid photos count:', validPhotos.length);
    console.log('BeforePhotosSection - hasBeforePhotos:', hasBeforePhotos);
    
    // Detailed analysis of photos
    if (beforePhotos && beforePhotos.length > 0) {
      const validCount = beforePhotos.filter(url => url && typeof url === 'string' && !url.startsWith('blob:')).length;
      const blobCount = beforePhotos.filter(url => url && typeof url === 'string' && url.startsWith('blob:')).length;
      const invalidCount = beforePhotos.filter(url => !url || typeof url !== 'string').length;
      
      console.log(`Photo analysis: Valid: ${validCount}, Blob URLs: ${blobCount}, Invalid: ${invalidCount}`);
      
      beforePhotos.forEach((url, index) => {
        const isValid = url && typeof url === 'string' && !url.startsWith('blob:');
        const isBlob = url && typeof url === 'string' && url.startsWith('blob:');
        console.log(`Photo ${index}: ${isValid ? 'VALID' : isBlob ? 'BLOB URL' : 'INVALID'} - ${url}`);
      });
    }
  }, [area, beforePhotos, validPhotos, hasBeforePhotos]);

  if (!hasBeforePhotos) {
    return (
      <EmptyPhotoState 
        area={area}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={onSelectBeforePhotos}
        onUploadBeforePhotos={onUploadBeforePhotos}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PhotoGrid 
        photos={validPhotos} 
        onRemovePhoto={onRemovePhoto} 
        onReorderPhotos={onReorderPhotos} 
      />
      
      <PhotoControls 
        area={area}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={onSelectBeforePhotos}
        onUploadBeforePhotos={onUploadBeforePhotos}
      />
    </div>
  );
};

export default React.memo(BeforePhotosSection);
