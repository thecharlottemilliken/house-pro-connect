
import React, { useState } from 'react';
import { DesignPreferences, RenovationArea } from "@/hooks/useProjectData";
import EmptyDesignState from "./EmptyDesignState";
import RoomDetails from "./RoomDetails";
import DesignAssetsCard from "./DesignAssetsCard";
import PinterestInspirationSection from "./PinterestInspirationSection";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import { RoomPreference } from "@/hooks/useRoomDesign";
import AfterPhotosSection from './AfterPhotosSection';
import BeforePhotosCard from './BeforePhotosCard';
import RoomMeasurementsCard from './RoomMeasurementsCard';
import MeasurementsBanner from './MeasurementsBanner';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface RoomTabContentProps {
  area: RenovationArea;
  hasDesigns: boolean;
  hasRenderings: boolean;
  designers: Array<{ id: string; businessName: string }>;
  designAssets?: Array<{ name: string; url: string }>;
  renderingImages?: string[];
  beforePhotos: string[];
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  roomId?: string;
  roomPreferences: RoomPreference | null;
  propertyPhotos: string[];
  propertyBlueprint?: string | null;
  propertyId?: string;
  projectId: string;
  onAddDesigner: () => void;
  onAddRenderings: () => void;
  onAddDrawings: () => void;
  onAddBlueprints: () => void;
  onSaveMeasurements: (measurements: any) => void;
  onSelectBeforePhotos: (photos: string[]) => void;
  onUploadBeforePhotos: (photos: string[]) => void;
  onAddProjectFiles: (files: string[]) => void;
  onRemoveDesignAsset: (index: number) => void;
  onAddInspirationImages: (images: string[], roomId?: string) => void;
  onAddPinterestBoards: (boards: any[], room: string, roomId?: string) => void;
}

const RoomTabContent: React.FC<RoomTabContentProps> = ({
  area,
  hasDesigns,
  hasRenderings,
  designers,
  designAssets = [],
  renderingImages = [],
  beforePhotos = [],
  measurements,
  roomId,
  roomPreferences,
  propertyPhotos,
  propertyBlueprint,
  propertyId,
  projectId,
  onAddDesigner,
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
  onSaveMeasurements,
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  onAddProjectFiles,
  onRemoveDesignAsset,
  onAddInspirationImages,
  onAddPinterestBoards
}) => {
  const handleAddDesignPlans = () => console.log("Add design plans clicked");
  const [showMeasuringDialog, setShowMeasuringDialog] = useState(false);
  
  // Check if measurements exist
  const hasMeasurements = measurements && 
    (measurements.length || measurements.width || measurements.height || measurements.additionalNotes);

  return (
    <div className="w-full space-y-8">
      {hasDesigns ? (
        <div className="space-y-8">
          {/* Room Details Card */}
          <RoomDetails 
            area={area.area}
            location={area.location}
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
          />
          
          {/* Two-column layout for Before/After Photos and Measurement Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BeforePhotosCard
              area={area.area}
              beforePhotos={beforePhotos}
              propertyPhotos={propertyPhotos}
              onSelectBeforePhotos={onSelectBeforePhotos}
              onUploadBeforePhotos={onUploadBeforePhotos}
            />
            
            <AfterPhotosSection 
              area={area.area}
              photos={[]} // Initialize with empty array since this is a new component
              onUploadPhotos={() => console.log("Upload after photos clicked")}
            />
          </div>
          
          {/* Show Measurements Banner or Measurements Card */}
          {!hasMeasurements ? (
            <MeasurementsBanner 
              area={area.area}
              onMeasureRoom={() => setShowMeasuringDialog(true)}
            />
          ) : (
            <RoomMeasurementsCard 
              area={area.area}
              measurements={measurements}
              onSaveMeasurements={onSaveMeasurements}
            />
          )}
          
          <DesignAssetsCard 
            hasRenderings={hasRenderings}
            renderingImages={renderingImages}
            onAddRenderings={onAddRenderings}
            onAddDrawings={onAddDrawings}
            onAddBlueprints={onAddBlueprints}
            propertyBlueprint={propertyBlueprint}
            propertyId={propertyId}
            currentRoom={area.area}
            propertyPhotos={propertyPhotos}
          />
        </div>
      ) : (
        <EmptyDesignState 
          type="no-designs"
          onAction={handleAddDesignPlans}
        />
      )}
      
      {/* Room Measuring Dialog */}
      <Dialog open={showMeasuringDialog} onOpenChange={setShowMeasuringDialog}>
        <DialogContent className="max-w-4xl">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Measure Your Room</h2>
            <RoomMeasurementsCard 
              area={area.area}
              measurements={measurements || { unit: 'ft' }}
              onSaveMeasurements={(newMeasurements) => {
                onSaveMeasurements(newMeasurements);
                setShowMeasuringDialog(false);
              }}
              initialEditMode={true}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="mt-8 w-full">
        {roomId && (
          <PinterestInspirationSection 
            inspirationImages={roomPreferences?.inspirationImages || []}
            pinterestBoards={roomPreferences?.pinterestBoards || []}
            onAddInspiration={onAddInspirationImages}
            onAddPinterestBoards={onAddPinterestBoards}
            currentRoom={area.area}
            roomId={roomId}
          />
        )}
      </div>

      <div className="mt-8 w-full">
        <RecommendedContent />
      </div>
    </div>
  );
};

export default RoomTabContent;
