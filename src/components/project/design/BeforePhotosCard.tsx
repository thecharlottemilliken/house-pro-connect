
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
    <Card className="overflow-hidden border-0 shadow-none bg-black text-white h-full">
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4">
          <h3 className="font-bold text-xl">Before Photos</h3>
          {beforePhotos.length > 0 && (
            <Button 
              variant="ghost" 
              className="text-blue-400 hover:text-blue-500 uppercase tracking-wider text-xs underline underline-offset-4 p-0 h-auto"
            >
              MANAGE PHOTOS
            </Button>
          )}
        </div>
        
        <div className="p-4 pt-0">
          <BeforePhotosSection
            area={area}
            beforePhotos={beforePhotos}
            propertyPhotos={propertyPhotos}
            onSelectBeforePhotos={onSelectBeforePhotos}
            onUploadBeforePhotos={onUploadBeforePhotos}
            onRemovePhoto={handleRemovePhoto}
            onReorderPhotos={handleReorderPhotos}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BeforePhotosCard;
