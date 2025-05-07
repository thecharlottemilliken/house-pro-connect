
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Plus, Upload } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { PropertyImageCarousel } from "@/components/property/PropertyImageCarousel";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";
import { GripVertical } from "lucide-react";

interface BeforePhotosSectionProps {
  area: string;
  beforePhotos: string[];
  propertyPhotos: string[];
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
  onRemovePhoto: (index: number) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
}

const BeforePhotosSection = ({
  area,
  beforePhotos,
  propertyPhotos,
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  onRemovePhoto,
  onReorderPhotos
}: BeforePhotosSectionProps) => {
  const hasBeforePhotos = beforePhotos.length > 0;

  return (
    <div className="space-y-4">
      {hasBeforePhotos ? (
        <div className="space-y-6">
          {beforePhotos.length > 1 && (
            <div className="rounded-lg overflow-hidden border border-gray-100">
              <PropertyImageCarousel images={beforePhotos} />
            </div>
          )}
          
          <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {beforePhotos.map((photo, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={photo} 
                  alt={`Before photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:text-white hover:bg-red-500/50 backdrop-blur-sm"
                      onClick={() => onRemovePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:text-white backdrop-blur-sm cursor-move"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        onReorderPhotos(fromIndex, index);
                      }}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <SelectPropertyPhotosDialog
              photos={propertyPhotos}
              onSelect={onSelectBeforePhotos}
            />
            <FileUpload
              label={<div className="flex items-center"><Plus className="h-4 w-4 mr-1" /> Upload More Photos</div>}
              description="Upload additional photos of the room's current state"
              accept="image/*"
              multiple={true}
              onUploadComplete={onUploadBeforePhotos}
              buttonVariant="outline"
              buttonClassName="border-[#174c65] text-[#174c65] hover:bg-[#174c65]/5"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 rounded-full bg-[#174c65]/10 flex items-center justify-center mb-3">
            <Upload className="h-6 w-6 text-[#174c65]" />
          </div>
          <h4 className="font-semibold text-gray-900">No before photos added yet</h4>
          <p className="text-gray-500 max-w-md mt-1 mb-4">
            Upload photos of your {area.toLowerCase()} before renovation to document the transformation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {propertyPhotos.length > 0 ? (
              <>
                <SelectPropertyPhotosDialog
                  photos={propertyPhotos}
                  onSelect={onSelectBeforePhotos}
                />
                <FileUpload
                  label={<div className="flex items-center"><Plus className="h-4 w-4 mr-1" /> Upload Photos</div>}
                  description="Upload photos of the room's current state"
                  accept="image/*"
                  multiple={true}
                  onUploadComplete={onUploadBeforePhotos}
                  buttonVariant="outline"
                  buttonClassName="border-[#174c65] text-[#174c65] hover:bg-[#174c65]/5"
                />
              </>
            ) : (
              <FileUpload
                label={<div className="flex items-center"><Plus className="h-4 w-4 mr-1" /> Upload Photos</div>}
                description="Upload photos of the room's current state"
                accept="image/*"
                multiple={true}
                onUploadComplete={onUploadBeforePhotos}
                buttonVariant="outline"
                buttonClassName="border-[#174c65] text-[#174c65] hover:bg-[#174c65]/5"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforePhotosSection;
