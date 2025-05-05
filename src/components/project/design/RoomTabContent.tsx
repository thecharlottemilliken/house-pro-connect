
import React from 'react';
import { DesignPreferences, RenovationArea } from "@/hooks/useProjectData";
import EmptyDesignState from "./EmptyDesignState";
import RoomDetails from "./RoomDetails";
import DesignAssetsCard from "./DesignAssetsCard";
import PinterestInspirationSection from "./PinterestInspirationSection";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import { RoomPreference } from "@/hooks/useRoomDesign";

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
    <div className="w-full">
      {hasDesigns ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
          <div className="col-span-1 lg:col-span-2 w-full">
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
          </div>
          
          <div className="col-span-1 lg:col-span-3 w-full">
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
