
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Plus } from "lucide-react";
import { FileItem } from "@/components/ui/file-upload";
import { Separator } from "@/components/ui/separator";

interface BeforePhotosCardProps {
  area: string;
  beforePhotos: string[];
  onSelectPhotosClick: () => void;
  onUploadPhotosClick?: () => void;
}

const BeforePhotosCard: React.FC<BeforePhotosCardProps> = ({
  area,
  beforePhotos = [],
  onSelectPhotosClick,
  onUploadPhotosClick
}) => {
  return (
    <Card className="shadow-sm border-gray-200/50">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-base">Before Photos</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onSelectPhotosClick}>
              Select photos
            </Button>
            {onUploadPhotosClick && (
              <Button variant="outline" size="sm" onClick={onUploadPhotosClick}>
                Upload photos
              </Button>
            )}
          </div>
        </div>

        {beforePhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {beforePhotos.map((photo, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-md border border-gray-200">
                <img
                  src={photo}
                  alt={`${area} before photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No before photos added yet</p>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Add photos of your {area} current state to help designers understand the space
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BeforePhotosCard;
