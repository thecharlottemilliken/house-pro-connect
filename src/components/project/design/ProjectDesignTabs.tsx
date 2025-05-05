
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RenovationArea, DesignPreferences } from "@/hooks/useProjectData";
import RoomTabContent from "./RoomTabContent";
import { RoomPreference } from "@/hooks/useRoomDesign";

interface ProjectDesignTabsProps {
  defaultTab: string;
  renovationAreas: RenovationArea[];
  designPreferences: DesignPreferences;
  roomPreferences: Record<string, RoomPreference>;
  propertyPhotos: string[];
  propertyBlueprint: string | null;
  propertyId?: string;
  projectId: string;
  getRoomIdByName: (name: string) => string | undefined;
  onAddDesigner: () => void;
  onAddRenderings: () => void;
  onAddDrawings: () => void;
  onAddBlueprints: () => void;
  onSaveMeasurements: (area: string, measurements: any) => void;
  onSelectBeforePhotos: (area: string, photos: string[]) => void;
  onUploadBeforePhotos: (area: string, photos: string[]) => void;
  onAddProjectFiles: (area: string, files: string[]) => void;
  onRemoveDesignAsset: (index: number) => void;
  onAddInspirationImages: (images: string[], roomId?: string) => void;
  onAddPinterestBoards: (boards: any[], room: string, roomId?: string) => void;
}

const ProjectDesignTabs: React.FC<ProjectDesignTabsProps> = ({
  defaultTab,
  renovationAreas,
  designPreferences,
  roomPreferences,
  propertyPhotos,
  propertyBlueprint,
  propertyId,
  projectId,
  getRoomIdByName,
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
  if (renovationAreas.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No renovation areas defined for this project.</p>
      </div>
    );
  }

  const hasDesigns = designPreferences.hasDesigns;
  const hasRenderings = designPreferences.renderingImages && designPreferences.renderingImages.length > 0;
  const designers = designPreferences.designers || [];
  
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-4">
        {renovationAreas.map((area, index) => (
          <TabsTrigger 
            key={area.area} 
            value={area.area.toLowerCase()} 
            className="flex items-center gap-2"
          >
            <span className={`w-5 h-5 flex items-center justify-center ${index === 0 ? 'bg-[#174c65] text-white' : 'bg-gray-300 text-gray-600'} rounded-full text-xs`}>
              {index + 1}
            </span>
            {area.area}
          </TabsTrigger>
        ))}
      </TabsList>

      {renovationAreas.map(area => {
        const areaKey = area.area.toLowerCase().replace(/\s+/g, '_');
        const beforePhotos = designPreferences.beforePhotos?.[areaKey] || [];
        const measurements = designPreferences.roomMeasurements?.[areaKey];
        const roomId = getRoomIdByName(area.area);
        const roomPrefs = roomId ? roomPreferences[roomId] : null;
        
        return (
          <TabsContent key={area.area} value={area.area.toLowerCase()} className="w-full">
            <RoomTabContent
              area={area}
              hasDesigns={hasDesigns}
              hasRenderings={hasRenderings}
              designers={designers}
              designAssets={designPreferences.designAssets}
              renderingImages={designPreferences.renderingImages}
              beforePhotos={beforePhotos}
              measurements={measurements}
              roomId={roomId}
              roomPreferences={roomPrefs || null}
              propertyPhotos={propertyPhotos}
              propertyBlueprint={propertyBlueprint}
              propertyId={propertyId}
              projectId={projectId}
              onAddDesigner={onAddDesigner}
              onAddRenderings={onAddRenderings}
              onAddDrawings={onAddDrawings}
              onAddBlueprints={onAddBlueprints}
              onSaveMeasurements={(newMeasurements) => onSaveMeasurements(area.area, newMeasurements)}
              onSelectBeforePhotos={(photos) => onSelectBeforePhotos(area.area, photos)}
              onUploadBeforePhotos={(photos) => onUploadBeforePhotos(area.area, photos)}
              onAddProjectFiles={(files) => onAddProjectFiles(area.area, files)}
              onRemoveDesignAsset={onRemoveDesignAsset}
              onAddInspirationImages={onAddInspirationImages}
              onAddPinterestBoards={onAddPinterestBoards}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default ProjectDesignTabs;
