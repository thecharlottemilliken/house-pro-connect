
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

  // Helper function to create grid layout based on number of photos
  const getPhotoGrid = () => {
    if (beforePhotos.length === 1) {
      return (
        <div className="w-full">
          <PhotoItem photo={beforePhotos[0]} index={0} />
        </div>
      );
    } else if (beforePhotos.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {beforePhotos.map((photo, index) => (
            <PhotoItem key={index} photo={photo} index={index} />
          ))}
        </div>
      );
    } else if (beforePhotos.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <PhotoItem photo={beforePhotos[0]} index={0} />
          </div>
          <div className="col-span-1">
            <PhotoItem photo={beforePhotos[1]} index={1} />
          </div>
          <div className="col-span-2">
            <PhotoItem photo={beforePhotos[2]} index={2} />
          </div>
        </div>
      );
    } else if (beforePhotos.length >= 4) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <PhotoItem photo={beforePhotos[0]} index={0} />
          <PhotoItem photo={beforePhotos[1]} index={1} />
          <PhotoItem photo={beforePhotos[2]} index={2} />
          {beforePhotos.length > 3 && (
            <PhotoItem photo={beforePhotos[3]} index={3} />
          )}
          {beforePhotos.length > 4 && (
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-4">
                {beforePhotos.slice(4).map((photo, idx) => (
                  <PhotoItem key={idx + 4} photo={photo} index={idx + 4} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Photo item component for reuse
  const PhotoItem = ({ photo, index }: { photo: string; index: number }) => (
    <div className="relative group rounded-lg overflow-hidden aspect-[4/3]">
      <img 
        src={photo} 
        alt={`Before photo ${index + 1}`}
        className="w-full h-full object-cover"
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
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {hasBeforePhotos ? (
        <>
          {/* Display photos in grid layout */}
          {getPhotoGrid()}
          
          {/* Photo controls - updated to use outlined buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <SelectPropertyPhotosDialog
              photos={propertyPhotos}
              onSelect={onSelectBeforePhotos}
              customButton={
                <Button
                  variant="outline"
                  className="w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
                >
                  Select from files
                </Button>
              }
            />
            <FileUpload
              label="Upload"
              description="Upload additional photos of the room's current state"
              accept="image/*"
              multiple={true}
              onUploadComplete={onUploadBeforePhotos}
              className="w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
            >
              Upload
            </FileUpload>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Upload className="h-6 w-6 text-gray-500" />
          </div>
          <h4 className="font-semibold text-gray-900">No before photos added yet</h4>
          <p className="text-gray-500 max-w-md mt-1 mb-6">
            Upload photos of your {area.toLowerCase()} before renovation to document the transformation
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full mt-2">
            {propertyPhotos.length > 0 ? (
              <>
                <SelectPropertyPhotosDialog
                  photos={propertyPhotos}
                  onSelect={onSelectBeforePhotos}
                  customButton={
                    <Button
                      variant="outline"
                      className="w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
                    >
                      Select from files
                    </Button>
                  }
                />
                <FileUpload
                  label="Upload"
                  description="Upload photos of the room's current state"
                  accept="image/*"
                  multiple={true}
                  onUploadComplete={onUploadBeforePhotos}
                  className="w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
                >
                  Upload
                </FileUpload>
              </>
            ) : (
              <FileUpload
                label="Upload"
                description="Upload photos of the room's current state"
                accept="image/*"
                multiple={true}
                onUploadComplete={onUploadBeforePhotos}
                className="col-span-2 w-full border-[#1A6985] border-2 text-[#1A6985] hover:bg-transparent hover:text-[#1A6985]/90 font-medium uppercase tracking-wider py-6"
              >
                Upload
              </FileUpload>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforePhotosSection;
