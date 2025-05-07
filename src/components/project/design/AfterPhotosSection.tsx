
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AfterPhotosSectionProps {
  area: string;
  photos: string[];
  onUploadPhotos: (photos: string[]) => void;
}

const AfterPhotosSection = ({
  area,
  photos,
  onUploadPhotos
}: AfterPhotosSectionProps) => {
  const hasPhotos = photos.length > 0;

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        <div className="bg-[#174c65] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xl">After Photos</h3>
              <p className="text-white/80 mt-1">Document the transformation of your {area}</p>
            </div>
            {hasPhotos && (
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
        
        {hasPhotos ? (
          <div className="p-6">
            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={photo} 
                    alt={`After photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#174c65]/10 flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-[#174c65]" />
            </div>
            <h4 className="font-semibold text-gray-900">No after photos added yet</h4>
            <p className="text-gray-500 max-w-md mt-1 mb-4">
              Upload photos of your {area} after renovation to document the transformation
            </p>
            <FileUpload
              label="Upload Photos"
              description="Add photos of your completed renovation"
              accept="image/*"
              multiple={true}
              onUploadComplete={onUploadPhotos}
              className="border-[#174c65] text-[#174c65] hover:bg-[#174c65]/5"
            >
              <Plus className="h-4 w-4 mr-1" /> Upload Photos
            </FileUpload>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AfterPhotosSection;
