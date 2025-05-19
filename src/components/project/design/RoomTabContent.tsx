
import React, { useState, useEffect } from 'react';
import { DesignPreferences, RenovationArea } from "@/hooks/useProjectData";
import EmptyDesignState from "./EmptyDesignState";
import PinterestInspirationSection from "./PinterestInspirationSection";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import { RoomPreference } from "@/hooks/useRoomDesign";
import RoomDetailsSection from './room-tabs/RoomDetailsSection';
import RoomMeasurementsDialog from './room-tabs/RoomMeasurementsDialog';

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
  
  // Filter design assets for the current room with improved logic
  const roomDesignAssets = designAssets.filter(asset => {
    // Match by roomId (exact match)
    if (asset.roomId && roomId && asset.roomId === roomId) {
      return true;
    }
    
    // Match by tag if area name is in the tags
    if (asset.tags && asset.tags.some(tag => 
      tag.toLowerCase() === area.area.toLowerCase())) {
      return true;
    }
    
    // For assets with no room association, exclude them
    return false;
  });

  // Added debugging to verify the filtered assets
  useEffect(() => {
    console.log("Room design assets for", area.area, ":", roomDesignAssets);
    console.log("All design assets:", designAssets);
  }, [area.area, roomDesignAssets, designAssets]);
  
  // Check if measurements exist
  const hasMeasurements = measurements && 
    (measurements.length || measurements.width || measurements.height || measurements.additionalNotes);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-8">
        {/* Room Details and Measurements Section with Photos */}
        <RoomDetailsSection 
          area={area.area}
          location={area.location}
          designers={designers}
          designAssets={roomDesignAssets}
          measurements={measurements}
          roomId={roomId}
          projectId={projectId}
          hasMeasurements={!!hasMeasurements}
          onAddDesigner={onAddDesigner}
          onSaveMeasurements={onSaveMeasurements}
          onSelectBeforePhotos={onSelectBeforePhotos}
          onUploadBeforePhotos={onUploadBeforePhotos}
          onAddProjectFiles={onAddProjectFiles}
          onRemoveDesignAsset={(index) => {
            // Find the original index in the full designAssets array
            const assetToRemove = roomDesignAssets[index];
            const originalIndex = designAssets.findIndex(asset => 
              asset.name === assetToRemove.name && 
              asset.url === assetToRemove.url
            );
            
            if (originalIndex !== -1) {
              onRemoveDesignAsset(originalIndex);
            }
          }}
          onUpdateAssetTags={(index, tags) => {
            // Find the original index in the full designAssets array
            const assetToUpdate = roomDesignAssets[index];
            const originalIndex = designAssets.findIndex(asset => 
              asset.name === assetToUpdate.name && 
              asset.url === assetToUpdate.url
            );
            
            console.log("Updating tags for asset", assetToUpdate, "at global index", originalIndex);
            
            if (originalIndex !== -1) {
              onUpdateAssetTags(originalIndex, tags);
            }
          }}
          onMeasureRoom={() => setShowMeasuringDialog(true)}
          beforePhotos={beforePhotos}
          propertyPhotos={propertyPhotos}
        />
      </div>
      
      {/* Show empty design state only when explicitly indicated and no designers or assets */}
      {!hasDesigns && roomDesignAssets.length === 0 && designers.length === 0 && (
        <EmptyDesignState 
          type="no-designs"
          onAction={handleAddDesignPlans}
        />
      )}
      
      {/* Room Measuring Dialog */}
      <RoomMeasurementsDialog
        open={showMeasuringDialog}
        onOpenChange={setShowMeasuringDialog}
        area={area.area}
        measurements={measurements}
        onSaveMeasurements={onSaveMeasurements}
      />
      
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
