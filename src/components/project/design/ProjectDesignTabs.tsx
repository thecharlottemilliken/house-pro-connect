
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoomDetailsTab from "./room-details/RoomDetailsTab";
import BeforePhotosCard from "./BeforePhotosCard";
import MeasurementsCard from "./MeasurementsCard";
import { normalizeAreaName } from "@/lib/utils";

interface ProjectDesignTabsProps {
  defaultTab: string;
  renovationAreas: any[];
  designPreferences: any;
  roomPreferences: any;
  propertyPhotos: string[];
  propertyBlueprint: string | null;
  propertyId?: string; // Add propertyId prop
  projectId: string;
  getRoomIdByName: (name: string) => string | undefined;
  onAddDesigner: () => void;
  onAddRenderings: () => void;
  onAddDrawings: () => void;
  onAddBlueprints: () => void;
  onSaveMeasurements: (area: string, measurements: any) => Promise<any>;
  onSelectBeforePhotos: (area: string, photos: string[]) => Promise<any>;
  onUploadBeforePhotos: (area: string, photos: string[]) => Promise<any>;
  onAddProjectFiles: (area: string, files: string[]) => Promise<any>;
  onRemoveDesignAsset: (index: number) => Promise<any>;
  onUpdateAssetTags: (index: number, tags: string[]) => Promise<any>;
  onAddInspirationImages: (images: any[], roomId?: string) => Promise<any>;
  onAddPinterestBoards: (boards: any[], roomName?: string, roomId?: string) => Promise<any>;
}

const ProjectDesignTabs: React.FC<ProjectDesignTabsProps> = ({
  defaultTab,
  renovationAreas,
  designPreferences,
  roomPreferences,
  propertyPhotos,
  propertyBlueprint,
  propertyId, // Accept propertyId
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
  const [activeTab, setActiveTab] = useState<string>(defaultTab || "");
  const [localTabs, setLocalTabs] = useState<{ area: string }[]>([]);

  // Debug logs for propertyId
  useEffect(() => {
    console.log("ProjectDesignTabs - propertyId:", propertyId);
  }, [propertyId]);

  useEffect(() => {
    if (renovationAreas && renovationAreas.length > 0) {
      setLocalTabs(renovationAreas);
      if (!activeTab) {
        setActiveTab(renovationAreas[0].area.toLowerCase());
      }
    }
  }, [renovationAreas, activeTab]);

  const getMeasurements = (area: string) => {
    const normalizedArea = normalizeAreaName(area);
    if (designPreferences?.roomMeasurements && designPreferences.roomMeasurements[normalizedArea]) {
      return designPreferences.roomMeasurements[normalizedArea];
    }
    return { length: '', width: '', height: '', unit: 'ft' };
  };

  const getBeforePhotos = (area: string) => {
    if (designPreferences?.beforePhotos && designPreferences.beforePhotos[area]) {
      // Filter out invalid or blob URLs
      return designPreferences.beforePhotos[area].filter(
        (url: string) => url && typeof url === 'string' && !url.startsWith('blob:')
      );
    }
    return [];
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Create tab triggers for each renovation area
  const tabTriggers = localTabs.map((tab, index) => (
    <TabsTrigger key={`tab-${index}`} value={tab.area.toLowerCase()}>
      {tab.area}
    </TabsTrigger>
  ));

  const tabContent = localTabs.map((tab, index) => {
    const roomName = tab.area;
    const roomId = getRoomIdByName(roomName);
    const lowerRoomName = roomName.toLowerCase();
    
    return (
      <TabsContent key={`content-${index}`} value={lowerRoomName} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Before Photos Card */}
          <BeforePhotosCard 
            area={roomName}
            beforePhotos={getBeforePhotos(roomName)}
            propertyPhotos={propertyPhotos}
            propertyId={propertyId} // Pass propertyId to BeforePhotosCard
            onSelectBeforePhotos={(photos) => onSelectBeforePhotos(roomName, photos)}
            onUploadBeforePhotos={(photos) => onUploadBeforePhotos(roomName, photos)}
          />

          {/* Measurements Card */}
          <MeasurementsCard 
            area={roomName}
            measurements={getMeasurements(roomName)}
            onSaveMeasurements={(measurements) => onSaveMeasurements(roomName, measurements)}
          />
          
          {/* Room Details Card */}
          <RoomDetailsTab
            roomName={roomName}
            roomId={roomId}
            designPreferences={designPreferences}
            roomPreferences={roomPreferences[roomId] || {}}
            projectId={projectId}
            propertyId={propertyId} // Pass propertyId to RoomDetailsTab
            onAddProjectFiles={(files) => onAddProjectFiles(roomName, files)}
            onUpdateAssetTags={onUpdateAssetTags}
            onRemoveDesignAsset={onRemoveDesignAsset}
            onAddInspirationImages={onAddInspirationImages}
            onAddPinterestBoards={onAddPinterestBoards}
          />
        </div>
      </TabsContent>
    );
  });

  return (
    <Tabs 
      defaultValue={defaultTab} 
      value={activeTab} 
      onValueChange={handleTabChange}
      className="w-full" 
    >
      <TabsList className="w-full overflow-x-auto flex flex-nowrap mb-6">
        {tabTriggers}
      </TabsList>
      {tabContent}
    </Tabs>
  );
};

export default ProjectDesignTabs;
