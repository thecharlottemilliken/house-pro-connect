
import React from 'react';
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

const BeforePhotosSection = ({
  area,
  beforePhotos,
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  onRemovePhoto,
  onReorderPhotos
}: BeforePhotosSectionProps) => {
  const hasBeforePhotos = beforePhotos.length > 0;

  // Debug logging of before photos
  console.log(`BeforePhotosSection rendering for ${area} with ${beforePhotos.length} photos:`, beforePhotos);

  return (
    <div className="space-y-6">
      {hasBeforePhotos ? (
        <>
          <PhotoGrid 
            photos={beforePhotos} 
            onRemovePhoto={onRemovePhoto} 
            onReorderPhotos={onReorderPhotos} 
          />
          
          <PhotoControls 
            area={area}
            propertyPhotos={propertyPhotos}
            onSelectBeforePhotos={onSelectBeforePhotos}
            onUploadBeforePhotos={onUploadBeforePhotos}
          />
        </>
      ) : (
        <EmptyPhotoState 
          area={area}
          propertyPhotos={propertyPhotos}
          onSelectBeforePhotos={onSelectBeforePhotos}
          onUploadBeforePhotos={onUploadBeforePhotos}
        />
      )}
    </div>
  );
};

export default BeforePhotosSection;
