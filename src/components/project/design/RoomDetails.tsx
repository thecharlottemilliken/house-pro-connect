
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyDesignState from "./EmptyDesignState";
import { FileText, Upload, Image } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { PropertyImageCarousel } from "@/components/property/PropertyImageCarousel";

interface RoomDetailsProps {
  area: string;
  location?: string;
  designers?: Array<{ id: string; businessName: string; }>;
  designAssets?: Array<{ name: string; url: string; }>;
  onAddDesigner?: () => void;
  onUploadAssets?: () => void;
  propertyPhotos?: string[];
  onSelectBeforePhotos?: (photos: string[]) => void;
  onUploadBeforePhotos?: (photos: string[]) => void;
  beforePhotos?: string[];
}

const RoomDetails = ({
  area,
  location,
  designers,
  designAssets,
  onAddDesigner,
  onUploadAssets,
  propertyPhotos = [],
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  beforePhotos = []
}: RoomDetailsProps) => {
  const hasDesigner = designers && designers.length > 0;
  const hasBeforePhotos = beforePhotos.length > 0;

  return (
    <div className="col-span-1 lg:col-span-2">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{area}</h2>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          
          {location && (
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Location:</span>
              <span>{location}</span>
            </div>
          )}

          {/* Before Photos Section */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Before Photos</h3>
            {hasBeforePhotos ? (
              <div className="mb-4">
                <PropertyImageCarousel images={beforePhotos} />
              </div>
            ) : (
              <div className="space-y-4">
                {propertyPhotos.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => onSelectBeforePhotos?.([])}
                  >
                    <Image className="h-4 w-4" />
                    Select from Property Photos
                  </Button>
                )}
                
                <FileUpload
                  label="Upload Before Photos"
                  description="Upload photos of the room's current state"
                  accept="image/*"
                  multiple={true}
                  onUploadComplete={onUploadBeforePhotos}
                  uploadedFiles={beforePhotos}
                />
              </div>
            )}
          </div>

          {hasDesigner ? (
            <div className="space-y-4">
              {designers.map((designer, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">Designer:</span>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-300 mr-2"></div>
                    <span>{designer.businessName}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyDesignState 
              type="designer" 
              onAction={onAddDesigner}
            />
          )}

          {designAssets && designAssets.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Design Assets</h3>
              <div className="grid grid-cols-2 gap-3">
                {designAssets.map((asset, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">{asset.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomDetails;
