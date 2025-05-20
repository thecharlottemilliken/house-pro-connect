
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormattedTask, RenovationArea } from "@/hooks/useProjectData";
import { PropertyDetails } from "@/hooks/usePropertyData";
import { RoomPreference } from "@/hooks/useRoomDesign";
import RoomTabContent from "./RoomTabContent";
import ProjectOverviewTab from "./ProjectOverviewTab";
import { normalizeAreaName } from '@/lib/utils';

interface ProjectDesignContentProps {
  projectData: any;
  propertyDetails: PropertyDetails | null;
  isMobile: boolean;
  defaultTab: string;
  renovationAreas: RenovationArea[];
  roomPreferences: Record<string, RoomPreference | null>;
  designPreferences: any;
  propertyPhotos: string[];
  getRoomIdByName: (roomName: string) => string | undefined;
  enhancedHandlers: any;
  handlers: {
    handleAddDesigner: () => void;
    handleAddRenderings: () => void;
    handleAddDrawings: () => void;
    handleAddBlueprints: () => void;
    handleRemoveDesignAsset: (index: number) => void;
    handleAddInspirationImages: (images: string[]) => void;
    handleAddPinterestBoards: (boards: any[], room: string) => void;
    handleAddRoomInspirationImages: (images: string[], roomId?: string) => void;
    handleAddRoomPinterestBoards: (boards: any[], room: string, roomId?: string) => void;
  };
}

const ProjectDesignContent: React.FC<ProjectDesignContentProps> = ({
  projectData,
  propertyDetails,
  isMobile,
  defaultTab,
  renovationAreas,
  roomPreferences,
  designPreferences,
  propertyPhotos,
  getRoomIdByName,
  enhancedHandlers,
  handlers
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  
  // Debugs to make sure we're getting the correct data
  useEffect(() => {
    if (projectData?.design_preferences?.beforePhotos) {
      console.log("ProjectDesignContent - beforePhotos keys:", Object.keys(projectData.design_preferences.beforePhotos));
      
      // Debug existing photos for each area
      renovationAreas.forEach(area => {
        const normalizedArea = normalizeAreaName(area.area);
        const beforePhotos = projectData.design_preferences.beforePhotos[normalizedArea] || [];
        console.log(`ProjectDesignContent - Area: ${area.area}, Normalized: ${normalizedArea}, Photos: ${beforePhotos.length}`);
      });
    } else {
      console.log("ProjectDesignContent - No beforePhotos found in design preferences");
    }
  }, [projectData, renovationAreas]);
  
  // Generate the tab items for each renovation area
  const generateTabs = () => {
    return renovationAreas.map((area) => {
      const normalizedArea = normalizeAreaName(area.area); 
      const beforePhotos = projectData?.design_preferences?.beforePhotos?.[normalizedArea] || [];
      const roomId = getRoomIdByName(area.area);
      
      // Log room-specific data for debugging
      console.log(`Tab ${area.area} - Normalized: ${normalizedArea}, Room ID: ${roomId || 'none'}, Before Photos: ${beforePhotos.length}`);
      
      return (
        <TabsTrigger
          key={area.area}
          value={area.area.toLowerCase()}
          className="capitalize px-4 py-2 text-lg"
        >
          {area.area}
        </TabsTrigger>
      );
    });
  };
  
  // Generate the tab content for each renovation area
  const generateTabsContent = () => {
    return renovationAreas.map((area) => {
      const normalizedArea = normalizeAreaName(area.area);
      
      // Get measurements for this area
      const measurements = designPreferences?.roomMeasurements?.[normalizedArea] || {};
      
      // Get before photos for this area
      const beforePhotos = enhancedHandlers.getBeforePhotosForArea(area.area) || [];
      
      // Get room ID for this area
      const roomId = getRoomIdByName(area.area);
      const roomPreference = roomPreferences[roomId || ''] || null;
      
      console.log(`Content for ${area.area} - Room ID: ${roomId || 'none'}, Before Photos: ${beforePhotos.length}`);
      
      return (
        <TabsContent
          key={area.area}
          value={area.area.toLowerCase()}
          className="py-4"
          forceMount
        >
          <RoomTabContent
            area={area}
            hasDesigns={designPreferences.hasDesigns || false}
            hasRenderings={false}
            designers={[]}
            designAssets={designPreferences.designAssets || []}
            renderingImages={[]}
            beforePhotos={beforePhotos}
            measurements={measurements}
            roomId={roomId}
            roomPreferences={roomPreference}
            propertyPhotos={propertyPhotos}
            propertyBlueprint={propertyDetails?.blueprint_url}
            propertyId={propertyDetails?.id}
            projectId={projectData.id}
            onAddDesigner={handlers.handleAddDesigner}
            onAddRenderings={handlers.handleAddRenderings}
            onAddDrawings={handlers.handleAddDrawings}
            onAddBlueprints={handlers.handleAddBlueprints}
            onSaveMeasurements={(measurements) => enhancedHandlers.handleRoomMeasurements(area.area, measurements)}
            onSelectBeforePhotos={(photos) => enhancedHandlers.selectBeforePhotos(area.area, photos)}
            onUploadBeforePhotos={(photos) => enhancedHandlers.uploadBeforePhotos(area.area, photos)}
            onAddProjectFiles={(files) => enhancedHandlers.addProjectFiles(roomId, area.area, files)}
            onRemoveDesignAsset={handlers.handleRemoveDesignAsset}
            onUpdateAssetTags={enhancedHandlers.updateAssetTags}
            onAddInspirationImages={(images, roomId) => handlers.handleAddRoomInspirationImages(images, roomId)}
            onAddPinterestBoards={(boards, room, roomId) => handlers.handleAddRoomPinterestBoards(boards, room, roomId)}
          />
        </TabsContent>
      );
    });
  };
  
  return (
    <div className="max-w-[1400px] mx-auto pt-16 pb-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {propertyDetails?.property_name || 'Loading...'}
        </h1>
        <p className="text-gray-500 mt-1">
          {propertyDetails ? `${propertyDetails.address_line1}, ${propertyDetails.city}, ${propertyDetails.state} ${propertyDetails.zip_code}` : 'Loading...'}
        </p>
      </div>
      
      {renovationAreas.length > 0 ? (
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 border border-gray-200 p-1 rounded-lg overflow-x-auto flex w-full bg-white">
            <TabsTrigger
              value="overview"
              className="capitalize px-4 py-2 text-lg"
            >
              Overview
            </TabsTrigger>
            {generateTabs()}
          </TabsList>
          
          <TabsContent value="overview" className="py-4">
            <ProjectOverviewTab 
              projectData={projectData}
              propertyDetails={propertyDetails}
              isMobile={isMobile}
              renovationAreas={renovationAreas}
            />
          </TabsContent>
          
          {generateTabsContent()}
        </Tabs>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No renovation areas found. Please add areas to your project.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectDesignContent;
