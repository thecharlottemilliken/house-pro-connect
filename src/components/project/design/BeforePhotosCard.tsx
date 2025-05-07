
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BeforePhotosSection from "./BeforePhotosSection";

interface BeforePhotosCardProps {
  area: string;
  beforePhotos: string[];
  propertyPhotos: string[];
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
}

const BeforePhotosCard = ({
  area,
  beforePhotos,
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos,
}: BeforePhotosCardProps) => {
  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...beforePhotos];
    updatedPhotos.splice(index, 1);
    onSelectBeforePhotos(updatedPhotos);
  };

  const handleReorderPhotos = (fromIndex: number, toIndex: number) => {
    const updatedPhotos = [...beforePhotos];
    const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
    updatedPhotos.splice(toIndex, 0, movedPhoto);
    onSelectBeforePhotos(updatedPhotos);
  };

  return (
    <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white text-black h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl">Before Photos</h3>
          <Button 
            variant="ghost" 
            className="text-black hover:text-gray-700 font-medium text-lg p-0 h-auto"
          >
            Edit
          </Button>
        </div>
        
        <BeforePhotosSection
          area={area}
          beforePhotos={beforePhotos}
          propertyPhotos={propertyPhotos}
          onSelectBeforePhotos={onSelectBeforePhotos}
          onUploadBeforePhotos={onUploadBeforePhotos}
          onRemovePhoto={handleRemovePhoto}
          onReorderPhotos={handleReorderPhotos}
        />
      </CardContent>
    </Card>
  );
};

export default BeforePhotosCard;
