
import React from 'react';
import RoomDetails from "../RoomDetails";
import MeasurementsBanner from '../MeasurementsBanner';
import RoomMeasurementsCard from '../RoomMeasurementsCard';
import BeforePhotosCard from '../BeforePhotosCard';
import AfterPhotosSection from '../AfterPhotosSection';

interface RoomDetailsSectionProps {
  area: string;
  location?: string;
  designers: Array<{ id: string; businessName: string }>;
  designAssets: Array<{ name: string; url: string; tags?: string[]; roomId?: string }>;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  roomId?: string;
  projectId: string;
  hasMeasurements: boolean;
  onAddDesigner: () => void;
  onSaveMeasurements: (measurements: any) => void;
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
  onAddProjectFiles: (files: string[]) => void;
  onRemoveDesignAsset: (index: number) => void;
  onUpdateAssetTags: (assetIndex: number, tags: string[]) => void;
  onMeasureRoom: () => void;
  beforePhotos: string[];
  propertyPhotos: string[];
}

const RoomDetailsSection: React.FC<RoomDetailsSectionProps> = ({
  area,
  location,
  designers,
  designAssets,
  measurements,
  roomId,
  projectId,
  hasMeasurements,
  onAddDesigner,
  onSaveMeasurements,
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  onAddProjectFiles,
  onRemoveDesignAsset,
  onUpdateAssetTags,
  onMeasureRoom,
  beforePhotos,
  propertyPhotos
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: Room Details Card */}
      <div className="lg:col-span-1">
        <RoomDetails 
          area={area}
          location={location}
          designers={designers}
          designAssets={designAssets}
          measurements={measurements}
          onAddDesigner={onAddDesigner}
          onUploadAssets={() => console.log("Upload assets clicked")}
          onSaveMeasurements={onSaveMeasurements}
          propertyPhotos={propertyPhotos}
          onSelectBeforePhotos={onSelectBeforePhotos}
          onUploadBeforePhotos={onUploadBeforePhotos}
          beforePhotos={beforePhotos}
          projectId={projectId}
          onSelectProjectFiles={onAddProjectFiles}
          onRemoveDesignAsset={onRemoveDesignAsset}
          onUpdateAssetTags={onUpdateAssetTags}
          roomId={roomId}
        />
      </div>
      
      {/* Column 2-3: Measurements Banner/Card and Photos */}
      <div className="lg:col-span-2 space-y-6">
        {/* Show Measurements Banner or Measurements Card */}
        {!hasMeasurements ? (
          <MeasurementsBanner 
            area={area}
            onMeasureRoom={onMeasureRoom}
          />
        ) : (
          <RoomMeasurementsCard 
            area={area}
            measurements={measurements}
            onSaveMeasurements={onSaveMeasurements}
          />
        )}
        
        {/* Before and After Photos Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BeforePhotosCard
            area={area}
            beforePhotos={beforePhotos}
            propertyPhotos={propertyPhotos}
            onSelectBeforePhotos={onSelectBeforePhotos}
            onUploadBeforePhotos={onUploadBeforePhotos}
          />
          
          <AfterPhotosSection 
            area={area}
            photos={[]} 
            onUploadPhotos={() => console.log("Upload after photos clicked")}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsSection;
