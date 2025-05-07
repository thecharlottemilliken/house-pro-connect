
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
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        <div className="bg-[#174c65] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xl">Before Photos</h3>
              <p className="text-white/80 mt-1">Document the current state of your {area}</p>
            </div>
            {beforePhotos.length > 0 && (
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white text-[#174c65] hover:bg-gray-100"
              >
                Manage Photos
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-6">
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
