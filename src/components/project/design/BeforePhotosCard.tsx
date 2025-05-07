
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
    <Card className="shadow-lg border-gray-200/50 w-full">
      <CardContent className="p-4 sm:p-6">
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
