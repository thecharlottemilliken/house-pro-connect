
import React from 'react';
import PhotoControls from './PhotoControls';

interface EmptyPhotoStateProps {
  area: string;
  propertyPhotos: string[];
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
  isLoading?: boolean;
}

const EmptyPhotoState: React.FC<EmptyPhotoStateProps> = ({
  area,
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  isLoading = false
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">No photos yet</h3>
        <p className="text-sm text-gray-500 mb-6">
          Add photos to help designers understand the current state of your {area.toLowerCase()}
        </p>
        
        {isLoading ? (
          <div className="py-2 text-sm text-gray-500 animate-pulse">
            Processing...
          </div>
        ) : (
          <PhotoControls
            area={area}
            propertyPhotos={propertyPhotos}
            onSelectBeforePhotos={onSelectBeforePhotos}
            onUploadBeforePhotos={onUploadBeforePhotos}
            className="max-w-md mx-auto"
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(EmptyPhotoState);
