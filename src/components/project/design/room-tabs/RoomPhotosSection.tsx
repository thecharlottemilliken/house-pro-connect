
import React from 'react';
import BeforePhotosCard from '../BeforePhotosCard';
import AfterPhotosSection from '../AfterPhotosSection';

interface RoomPhotosSectionProps {
  area: string;
  beforePhotos: string[];
  propertyPhotos: string[];
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
}

const RoomPhotosSection: React.FC<RoomPhotosSectionProps> = ({
  area,
  beforePhotos,
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BeforePhotosCard
        area={area}
        beforePhotos={beforePhotos}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={onSelectBeforePhotos}
        onUploadBeforePhotos={onUploadBeforePhotos}
      />
      
      <AfterPhotosSection 
        area={area}
        photos={[]} // Initialize with empty array since this is a new component
        onUploadPhotos={() => console.log("Upload after photos clicked")}
      />
    </div>
  );
};

export default RoomPhotosSection;
