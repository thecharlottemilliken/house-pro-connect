
import React from 'react';
import { Upload } from "lucide-react";
import PhotoControls from "./PhotoControls";

interface EmptyPhotoStateProps {
  area?: string;
  propertyPhotos: string[];
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
}

const EmptyPhotoState: React.FC<EmptyPhotoStateProps> = ({
  area = '',
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
      <div>
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 mx-auto">
          <Upload className="h-6 w-6 text-gray-500" />
        </div>
        <h4 className="font-semibold text-gray-900">No before photos added yet</h4>
        <p className="text-gray-500 max-w-md mt-1 mb-4">
          Upload photos of your {area.toLowerCase()} before renovation to document the transformation
        </p>
      </div>
      
      <PhotoControls
        area={area}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={onSelectBeforePhotos}
        onUploadBeforePhotos={onUploadBeforePhotos}
        className="w-full"
      />
    </div>
  );
};

export default React.memo(EmptyPhotoState);
