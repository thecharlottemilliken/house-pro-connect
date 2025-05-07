
import React from 'react';
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

  return (
    <div className="w-full space-y-8">
      {hasDesigns ? (
        <div className="grid grid-cols-1 w-full space-y-8">
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
          
          <RoomMeasurementsCard 
            area={area.area}
            measurements={measurements}
            onSaveMeasurements={onSaveMeasurements}
          />
          
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
