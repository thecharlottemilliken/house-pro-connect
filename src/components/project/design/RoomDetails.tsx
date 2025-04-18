
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyDesignState from "./EmptyDesignState";
import { FileText, Upload, Image as ImageIcon, X, GripVertical, PenLine } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { PropertyImageCarousel } from "@/components/property/PropertyImageCarousel";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";

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

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...beforePhotos];
    updatedPhotos.splice(index, 1);
    onSelectBeforePhotos!(updatedPhotos);
  };

  const handleReorderPhotos = (fromIndex: number, toIndex: number) => {
    const updatedPhotos = [...beforePhotos];
    const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
    updatedPhotos.splice(toIndex, 0, movedPhoto);
    onSelectBeforePhotos!(updatedPhotos);
  };

  return (
    <div className="col-span-1 lg:col-span-2">
      <Card className="shadow-lg border-gray-200/50">
        <CardContent className="p-6 space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{area}</h2>
              {location && (
                <p className="text-sm text-gray-600 mt-1">{location}</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <PenLine className="h-4 w-4" />
              Edit
            </Button>
          </div>

          {/* Before Photos Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">Before Photos</h3>
                <p className="text-sm text-gray-500 mt-1">Document the current state of your space</p>
              </div>
              {hasBeforePhotos && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onSelectBeforePhotos!([])}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {hasBeforePhotos ? (
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden border border-gray-100">
                  <PropertyImageCarousel images={beforePhotos} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {beforePhotos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
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
                            onClick={() => handleRemovePhoto(index)}
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
                              handleReorderPhotos(fromIndex, index);
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
                    onSelect={onSelectBeforePhotos!}
                  />
                  <FileUpload
                    label="Upload More Photos"
                    description="Upload additional photos of the room's current state"
                    accept="image/*"
                    multiple={true}
                    onUploadComplete={onUploadBeforePhotos}
                    uploadedFiles={beforePhotos}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {propertyPhotos.length > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <SelectPropertyPhotosDialog
                      photos={propertyPhotos}
                      onSelect={onSelectBeforePhotos!}
                    />
                    <FileUpload
                      label="Upload Before Photos"
                      description="Upload photos of the room's current state"
                      accept="image/*"
                      multiple={true}
                      onUploadComplete={onUploadBeforePhotos}
                      uploadedFiles={beforePhotos}
                    />
                  </div>
                ) : (
                  <FileUpload
                    label="Upload Before Photos"
                    description="Upload photos of the room's current state"
                    accept="image/*"
                    multiple={true}
                    onUploadComplete={onUploadBeforePhotos}
                    uploadedFiles={beforePhotos}
                  />
                )}
              </div>
            )}
          </div>

          {/* Designer Section */}
          <div className="pt-4 border-t border-gray-100">
            {hasDesigner ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Designer</h3>
                  <p className="text-sm text-gray-500 mt-1">Assigned project designer</p>
                </div>
                {designers.map((designer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {designer.businessName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{designer.businessName}</p>
                        <p className="text-sm text-gray-500">Project Designer</p>
                      </div>
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
          </div>

          {/* Design Assets Section */}
          {designAssets && designAssets.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Design Assets</h3>
                <p className="text-sm text-gray-500 mt-1">Project documentation and specifications</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {designAssets.map((asset, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{asset.name}</span>
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
