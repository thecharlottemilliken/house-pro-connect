
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileUpload, FileWithPreview, extractUrls } from "@/components/ui/file-upload";
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
  
  // Handle FileWithPreview objects from FileUpload and convert to string[]
  const handleUploadComplete = (files: FileWithPreview[]) => {
    const urls = extractUrls(files);
    onUploadPhotos(urls);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-none h-full bg-[#e9f1f4]">
      <CardContent className="p-0">
        {hasPhotos ? (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-gray-900">After Photos</h3>
              <Button 
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 uppercase tracking-wider text-xs underline underline-offset-4 p-0 h-auto"
              >
                MANAGE PHOTOS
              </Button>
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
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
          <div className="p-4 flex flex-col h-full">
            <h3 className="font-bold text-xl text-gray-900 mb-2">Upload photos for Tile Milestone 1.</h3>
            
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-gray-700 text-sm mb-4 max-w-md">
                It looks like you recently finished a project milestone, take some photos and upload them to capture the progress.
              </p>
              
              <div>
                <FileUpload
                  label="UPLOAD PHOTOS"
                  description="Upload photos of your completed milestone"
                  accept="image/*"
                  multiple={true}
                  onUploadComplete={handleUploadComplete}
                  className="bg-[#b8d1db] text-gray-800 hover:bg-[#a7c0ca] border-0 px-4 py-2 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AfterPhotosSection;
