
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
  const [measurementsState, setMeasurementsState] = useState(measurements);

  // Debug when roomId or roomPreferences change
  useEffect(() => {
    console.log(`RoomTabContent - Area: ${area.area}, RoomId: ${roomId || 'undefined'}`);
    if (roomPreferences) {
      console.log(`RoomTabContent - Room has ${roomPreferences.inspirationImages?.length || 0} inspiration images and ${roomPreferences.pinterestBoards?.length || 0} Pinterest boards`);
    } else {
      console.log(`RoomTabContent - No room preferences found for area: ${area.area}`);
    }
  }, [area.area, roomId, roomPreferences]);

  // Enhanced handlers for before photo management
  const handleSelectBeforePhotos = (photos: string[]) => {
    console.log(`RoomTabContent - handleSelectBeforePhotos called with ${photos.length} photos`);
    onSelectBeforePhotos(photos);
  };

  const handleUploadBeforePhotos = (photos: string[]) => {
    console.log(`RoomTabContent - handleUploadBeforePhotos called with ${photos.length} photos`);
    onUploadBeforePhotos(photos);
  };

  // Filter design assets for the current room
  const roomDesignAssets = React.useMemo(() => {
    // Create a Set to track unique asset URLs (as a way to identify unique assets)
    const uniqueAssetUrls = new Set<string>();
    const filteredAssets = [];
    
    for (const asset of designAssets) {
      // Skip if we've already included this asset (based on URL)
      if (uniqueAssetUrls.has(asset.url)) {
        continue;
      }
      
      // Check if the asset belongs to this room
      const belongsToRoom = 
        // Exact match by roomId
        (asset.roomId && roomId && asset.roomId === roomId) || 
        // Match by tag if area name is in the tags
        (asset.tags && 
          asset.tags.some(tag => tag.toLowerCase() === area.area.toLowerCase()));
      
      if (belongsToRoom) {
        uniqueAssetUrls.add(asset.url);
        filteredAssets.push(asset);
      }
    }
    
    return filteredAssets;
  }, [designAssets, roomId, area.area]);

  // Enhanced check for measurements presence with better type checking
  const hasMeasurements = Boolean(
    measurementsState && (
      (typeof measurementsState.length === 'number' && measurementsState.length > 0) || 
      (typeof measurementsState.width === 'number' && measurementsState.width > 0) || 
      (typeof measurementsState.height === 'number' && measurementsState.height > 0) ||
      measurementsState.additionalNotes
    )
  );

  // Enhanced save measurements handler with better type validation
  const handleSaveMeasurements = (newMeasurements: any) => {
    console.log("RoomTabContent - Saving measurements:", JSON.stringify(newMeasurements, null, 2));
    
    // Ensure numeric values for measurements
    const normalizedMeasurements = {
      ...newMeasurements,
      length: typeof newMeasurements.length === 'string' ? parseFloat(newMeasurements.length) || undefined : newMeasurements.length,
      width: typeof newMeasurements.width === 'string' ? parseFloat(newMeasurements.width) || undefined : newMeasurements.width,
      height: typeof newMeasurements.height === 'string' ? parseFloat(newMeasurements.height) || undefined : newMeasurements.height,
      unit: newMeasurements.unit || 'ft'
    };
    
    console.log("RoomTabContent - Normalized measurements:", JSON.stringify(normalizedMeasurements, null, 2));
    
    // Call the original handler with normalized measurements
    onSaveMeasurements(normalizedMeasurements);
    
    // Update local state immediately for UI responsiveness
    setMeasurementsState(normalizedMeasurements);
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-8">
        {/* Room Details and Measurements Section with Photos */}
        <RoomDetailsSection 
          area={area.area}
          location={area.location}
          designers={designers}
          designAssets={roomDesignAssets}
          measurements={measurementsState}
          roomId={roomId}
          projectId={projectId}
          hasMeasurements={hasMeasurements}
          onAddDesigner={onAddDesigner}
          onSaveMeasurements={handleSaveMeasurements}
          onSelectBeforePhotos={handleSelectBeforePhotos}
          onUploadBeforePhotos={handleUploadBeforePhotos}
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
        measurements={measurementsState}
        onSaveMeasurements={(newMeasurements) => {
          handleSaveMeasurements(newMeasurements);
          setShowMeasuringDialog(false);
        }}
      />
      
      {/* Pinterest Inspiration Section - Full width */}
      <div className="mt-8 w-full">
        {roomId && (
          <PinterestInspirationSection 
            inspirationImages={roomPreferences?.inspirationImages || []}
            pinterestBoards={roomPreferences?.pinterestBoards || []}
            onAddInspiration={(images) => {
              console.log(`RoomTabContent onAddInspiration called with roomId: ${roomId}`);
              onAddInspirationImages(images, roomId);
            }}
            onAddPinterestBoards={(boards, roomName) => {
              console.log(`RoomTabContent onAddPinterestBoards called with roomId: ${roomId}`);
              onAddPinterestBoards(boards, roomName, roomId);
            }}
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
