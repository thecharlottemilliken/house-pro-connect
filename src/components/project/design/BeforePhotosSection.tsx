
import React, { useMemo } from 'react';
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
  const hasBeforePhotos = useMemo(() => beforePhotos.length > 0, [beforePhotos.length]);

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
    </div>
  );
};

export default React.memo(BeforePhotosSection);
