import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import EmptyDesignState from "./EmptyDesignState";
import DesignTabHeader from "./DesignTabHeader";
import BeforePhotosCard from "./BeforePhotosCard";
import RoomMeasurementsCard from './RoomMeasurementsCard';
import { PropertyFileUpload } from "@/components/property/PropertyFileUpload";
import { FileWithPreview } from "@/components/ui/file-upload";

interface RoomDetailsProps {
  area: string;
  location?: string;
  designers?: Array<{ id: string; businessName: string; }>;
  designAssets?: Array<{ name: string; url: string; }>;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  onAddDesigner?: () => void;
  onUploadAssets?: () => void;
  onSaveMeasurements?: (measurements: any) => void;
  propertyPhotos?: string[];
  onSelectBeforePhotos?: (photos: string[]) => void;
  onUploadBeforePhotos?: (photos: string[]) => void;
  beforePhotos?: string[];
}

const RoomDetails = ({
  area,
  location,
  designers,
  designAssets = [],
  measurements,
  onAddDesigner,
  onUploadAssets = () => {},
  onSaveMeasurements = () => {},
  propertyPhotos = [],
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  beforePhotos = []
}: RoomDetailsProps) => {
  const hasDesigner = designers && designers.length > 0;
  const [roomFiles, setRoomFiles] = useState<FileWithPreview[]>(() => {
    // Convert design assets to FileWithPreview format if available
    if (designAssets && designAssets.length > 0) {
      return designAssets.map((asset, index) => ({
        id: `asset-${index}`,
        name: asset.name,
        url: asset.url,
        size: 'Unknown',
        type: asset.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        progress: 100,
        status: 'complete' as const,
        tags: []
      }));
    }
    return [];
  });

  const handleFilesUploaded = (files: FileWithPreview[]) => {
    setRoomFiles(files);
    
    // Convert FileWithPreview to design assets format
    const assets = files
      .filter(file => file.status === 'complete' && file.url)
      .map(file => ({
        name: file.name,
        url: file.url as string
      }));
    
    // Call onUploadAssets with the new assets if needed
    onUploadAssets();
  };

  return (
    <div className="flex flex-col space-y-6">
      <Card>
        <CardContent className="p-6">
          <DesignTabHeader area={area} location={location} />
          
          {/* Designer Section */}
          <div className="mt-6">
            {hasDesigner ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Designer</h3>
                  <p className="text-sm text-gray-500 mt-1">Assigned project designer</p>
                </div>
                <div className="space-y-3">
                  {designers.map((designer, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                        {designer.businessName[0]}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{designer.businessName}</p>
                        <p className="text-sm text-gray-500">Project Designer</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyDesignState 
                type="designer" 
                onAction={onAddDesigner}
              />
            )}
          </div>

          {/* Combined Design Assets Section */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <div>
              <h3 className="font-semibold">Design Assets</h3>
              <p className="text-sm text-gray-500 mt-1">Project documentation</p>
            </div>
            
            {designAssets && designAssets.length > 0 ? (
              <div className="grid gap-3 mt-4">
                {designAssets.map((asset, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{asset.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <PropertyFileUpload
                  accept="image/*, .pdf, .dwg, .doc, .docx, .xls"
                  multiple={true}
                  label={`Upload ${area} Design Plans and Specs`}
                  description="Upload project documentation, plans, specifications, or materials"
                  initialFiles={roomFiles}
                  onFilesUploaded={handleFilesUploaded}
                  roomOptions={[
                    { value: "blueprint", label: "Blueprint" },
                    { value: "floorPlan", label: "Floor Plan" },
                    { value: "elevation", label: "Elevation" },
                    { value: "materials", label: "Materials" },
                    { value: "fixtures", label: "Fixtures" },
                    { value: "finishes", label: "Finishes" },
                    { value: "specifications", label: "Specifications" }
                  ]}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Room Measurements Section */}
      <RoomMeasurementsCard 
        area={area}
        measurements={measurements}
        onSaveMeasurements={onSaveMeasurements}
      />

      <BeforePhotosCard
        area={area}
        beforePhotos={beforePhotos}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={onSelectBeforePhotos!}
        onUploadBeforePhotos={onUploadBeforePhotos!}
      />
    </div>
  );
};

export default RoomDetails;
