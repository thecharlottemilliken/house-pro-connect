
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
  onUpdateAssetTags: (index: number, tags: string[]) => void;
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
  onUpdateAssetTags,
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

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg h-auto flex overflow-x-auto">
        {renovationAreas.map((area, index) => (
          <TabsTrigger 
            key={area.area} 
            value={area.area.toLowerCase()} 
            className="flex items-center gap-2 px-3 py-1 data-[state=active]:bg-[#174c65] data-[state=active]:text-white rounded"
          >
            <span className="inline-block">{area.area}</span>
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
              hasDesigns={designPreferences.hasDesigns}
              hasRenderings={designPreferences.renderingImages && designPreferences.renderingImages.length > 0}
              designers={designPreferences.designers || []}
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
              onUpdateAssetTags={onUpdateAssetTags}
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
