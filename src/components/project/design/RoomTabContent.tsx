
import React, { useState } from 'react';
import { DesignPreferences, RenovationArea } from "@/hooks/useProjectData";
import EmptyDesignState from "./EmptyDesignState";
import RoomDetails from "./RoomDetails";
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
  designAssets?: Array<{ name: string; url: string; tags?: string[]; roomId?: string }>;
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
  onUpdateAssetTags: (assetIndex: number, tags: string[]) => void;
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
  onUpdateAssetTags,
  onAddInspirationImages,
  onAddPinterestBoards
}) => {
  const handleAddDesignPlans = () => console.log("Add design plans clicked");
  const [showMeasuringDialog, setShowMeasuringDialog] = useState(false);
  
  // Filter design assets for the current room
  const roomDesignAssets = designAssets.filter(asset => 
    !asset.roomId || asset.roomId === roomId || 
    // Also include assets that have a tag matching the room name
    (asset.tags && asset.tags.some(tag => 
      tag.toLowerCase() === area.area.toLowerCase()))
  );
  
  // Check if measurements exist
  const hasMeasurements = measurements && 
    (measurements.length || measurements.width || measurements.height || measurements.additionalNotes);

  return (
    <div className="w-full space-y-8">
      {/* Always render the content regardless of hasDesigns - removed the conditional rendering */}
      <div className="space-y-8">
        {/* Three-column layout for Room Details, Measurements Banner, and Before/After Photos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Room Details Card - Always rendered now */}
          <div className="lg:col-span-1">
            <RoomDetails 
              area={area.area}
              location={area.location}
              designers={designers}
              // Pass the filtered design assets specific to this room
              designAssets={roomDesignAssets}
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
              onRemoveDesignAsset={(index) => {
                // Find the original index in the full designAssets array
                const assetToRemove = roomDesignAssets[index];
                const originalIndex = designAssets.findIndex(asset => 
                  asset.name === assetToRemove.name && 
                  asset.url === assetToRemove.url
                );
                onRemoveDesignAsset(originalIndex);
              }}
              onUpdateAssetTags={(index, tags) => {
                // Find the original index in the full designAssets array
                const assetToUpdate = roomDesignAssets[index];
                const originalIndex = designAssets.findIndex(asset => 
                  asset.name === assetToUpdate.name && 
                  asset.url === assetToUpdate.url
                );
                onUpdateAssetTags(originalIndex, tags);
              }}
              roomId={roomId}
            />
          </div>
          
          {/* Column 2-3: Measurements Banner/Card + Before/After Photos */}
          <div className="lg:col-span-2 space-y-6">
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
            
            {/* Before and After Photos Side-by-Side */}
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
          </div>
        </div>
      </div>
      
      {/* Show empty design state only when explicitly indicated and no designers or assets */}
      {!hasDesigns && roomDesignAssets.length === 0 && designers.length === 0 && (
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
      
      {/* Pinterest Inspiration Section - Full width */}
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

      {/* Recommended Content - Full width */}
      <div className="mt-8 w-full">
        <RecommendedContent />
      </div>
    </div>
  );
};

export default RoomTabContent;
