
import React from 'react';
import PhotoControls from './PhotoControls';

interface EmptyPhotoStateProps {
  area: string;
  propertyPhotos: string[];
  propertyId?: string; // Added propertyId prop
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
}

const EmptyPhotoState: React.FC<EmptyPhotoStateProps> = ({
  area,
  propertyPhotos,
  propertyId,
  onSelectBeforePhotos,
  onUploadBeforePhotos
}) => {
  return (
    <div className="text-center py-6 space-y-6">
      <div>
        <p className="text-gray-500">
          Add "before" photos of this area to help contractors understand the starting point.
        </p>
        <p className="text-gray-400 text-sm mt-1">
          You can upload new photos or select from your existing property photos.
        </p>
      </div>
      
      <PhotoControls 
        area={area}
        propertyPhotos={propertyPhotos}
        propertyId={propertyId}
        onSelectBeforePhotos={onSelectBeforePhotos}
        onUploadBeforePhotos={onUploadBeforePhotos}
        className="max-w-md mx-auto"
      />
    </div>
  );
};

export default React.memo(EmptyPhotoState);
