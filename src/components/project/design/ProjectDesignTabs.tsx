
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoomDetails from './RoomDetails';
import BeforePhotosSection from './BeforePhotosSection';
import PinterestInspirationSection from './PinterestInspirationSection';
import DesignAssetsCard from './DesignAssetsCard';

interface ProjectDesignTabsProps {
  defaultTab: string;
  renovationAreas: Array<{ area: string; location?: string }>;
  designPreferences: any;
  roomPreferences: any;
  propertyPhotos?: string[];
  propertyBlueprint?: string | null;
  propertyId?: string;
  projectId: string;
  getRoomIdByName: (name: string) => string | undefined;
  onAddDesigner?: () => void;
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
  onSaveMeasurements?: (area: string, measurements: any) => void;
  onSelectBeforePhotos?: (area: string, photos: string[]) => void;
  onUploadBeforePhotos?: (area: string, photos: string[]) => void;
  onAddProjectFiles?: (area: string, files: string[]) => void;
  onRemoveDesignAsset?: (index: number) => void;
  onUpdateAssetTags?: (index: number, tags: string[]) => void;
  onAddInspirationImages?: (images: string[], roomId?: string) => void;
  onAddPinterestBoards?: (boards: any[], room: string, roomId?: string) => void;
}

const ProjectDesignTabs = ({
  defaultTab,
  renovationAreas,
  designPreferences,
  roomPreferences,
  propertyPhotos = [],
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
}: ProjectDesignTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Function to render tab content for a specific area
  const renderTabContent = (area: string, location?: string) => {
    // Convert area name to lowercase and use as key in preferences
    const areaKey = area.toLowerCase();
    const measurements = designPreferences?.roomMeasurements?.[areaKey];
    const beforePhotos = designPreferences?.beforePhotos?.[areaKey] || [];
    const roomId = getRoomIdByName(area);
    const designAssets = designPreferences?.designAssets || [];
    
    const areaRoomPreferences = roomId ? roomPreferences[roomId] || {} : {};
    const inspirationImages = areaRoomPreferences.inspiration_images || [];
    const pinterestBoards = areaRoomPreferences.pinterest_boards || [];
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-4">
          <RoomDetails
            area={area}
            location={location}
            measurements={measurements}
            designAssets={designAssets}
            propertyPhotos={propertyPhotos}
            beforePhotos={beforePhotos}
            onSelectBeforePhotos={photos => onSelectBeforePhotos?.(area, photos)}
            onUploadBeforePhotos={photos => onUploadBeforePhotos?.(area, photos)}
            onSaveMeasurements={newMeasurements => onSaveMeasurements?.(area, newMeasurements)}
            projectId={projectId}
            onSelectProjectFiles={files => onAddProjectFiles?.(area, files)}
            onRemoveDesignAsset={onRemoveDesignAsset}
            onUpdateAssetTags={onUpdateAssetTags}
          />
          
          <BeforePhotosSection 
            propertyPhotos={propertyPhotos}
            beforePhotos={beforePhotos}
            onSelectBeforePhotos={photos => onSelectBeforePhotos?.(area, photos)}
            onUploadBeforePhotos={photos => onUploadBeforePhotos?.(area, photos)}
            currentRoom={area}
          />
        </div>
        
        <div className="flex flex-col space-y-4">
          <PinterestInspirationSection 
            inspirationImages={inspirationImages}
            pinterestBoards={pinterestBoards}
            onAddInspiration={onAddInspirationImages}
            onAddPinterestBoards={onAddPinterestBoards}
            currentRoom={area}
            roomId={roomId}
          />
          
          <DesignAssetsCard
            hasRenderings={!!designPreferences?.hasDesigns}
            renderingImages={[]}
            onAddRenderings={onAddRenderings}
            onAddDrawings={onAddDrawings}
            onAddBlueprints={onAddBlueprints}
            propertyBlueprint={propertyBlueprint}
            propertyId={propertyId}
            currentRoom={area}
            propertyPhotos={propertyPhotos}
          />
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="bg-transparent border-b w-full justify-start mb-6 h-auto overflow-x-auto flex-nowrap whitespace-nowrap">
        {renovationAreas.map(({ area }) => (
          <TabsTrigger
            key={area}
            value={area.toLowerCase()}
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#1A6985] data-[state=active]:text-[#1A6985] data-[state=active]:rounded-none data-[state=active]:shadow-none px-4 py-2 font-medium"
          >
            {area}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {renovationAreas.map(({ area, location }) => (
        <TabsContent key={area} value={area.toLowerCase()} className="mt-0">
          {renderTabContent(area, location)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ProjectDesignTabs;
