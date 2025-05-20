
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RenovationArea } from "@/hooks/useProjectData";
import { PropertyDetails } from "@/hooks/useProjectData";
import { RoomPreference } from "@/hooks/useRoomDesign";
import RoomTabContent from "./RoomTabContent";
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
  refreshRoomPreferences: (roomId?: string) => Promise<void>;
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
  refreshRoomPreferences,
  enhancedHandlers,
  handlers
}) => {
  // Use normalized area names for consistent tab values
  const normalizedDefaultTab = defaultTab ? normalizeAreaName(defaultTab) : '';
  const [activeTab, setActiveTab] = useState<string>(normalizedDefaultTab);
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(undefined);
  
  // Ensure activeTab is set whenever defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      const normalized = normalizeAreaName(defaultTab);
      console.log(`Setting active tab to normalized value: ${normalized} (from ${defaultTab})`);
      setActiveTab(normalized);
      
      // Set the initial active room ID
      const roomId = getRoomIdByName(defaultTab);
      if (roomId) {
        console.log(`Setting initial active room ID: ${roomId}`);
        setActiveRoomId(roomId);
      }
    } else if (renovationAreas.length > 0) {
      // Fallback to first area if no default tab
      const firstAreaNormalized = normalizeAreaName(renovationAreas[0].area);
      console.log(`No default tab, falling back to first area: ${firstAreaNormalized}`);
      setActiveTab(firstAreaNormalized);
      
      // Set active room ID based on the first area
      const roomId = getRoomIdByName(renovationAreas[0].area);
      if (roomId) {
        console.log(`Setting fallback active room ID: ${roomId}`);
        setActiveRoomId(roomId);
      }
    }
  }, [defaultTab, renovationAreas, getRoomIdByName]);
  
  // Debug handler for tab changes
  const handleTabChange = (value: string) => {
    console.log(`Tab changed to: ${value}`);
    setActiveTab(value);
    
    // Find the area that corresponds to this tab value
    const selectedArea = renovationAreas.find(
      area => normalizeAreaName(area.area) === value
    );
    
    if (selectedArea) {
      // Get the room ID for the selected area
      const newRoomId = getRoomIdByName(selectedArea.area);
      console.log(`Tab change: Found room ID ${newRoomId} for area ${selectedArea.area}`);
      
      // Update the active room ID and refresh room preferences
      if (newRoomId) {
        setActiveRoomId(newRoomId);
        
        // Refresh room preferences for the newly selected room
        console.log(`Refreshing preferences for room ID: ${newRoomId}`);
        refreshRoomPreferences(newRoomId).catch(error => {
          console.error(`Failed to refresh room preferences for ${newRoomId}:`, error);
        });
      } else {
        console.warn(`No room ID found for area: ${selectedArea.area}`);
      }
    } else {
      console.warn(`No area found for tab value: ${value}`);
    }
  };
  
  // Effect to refresh room preferences when active room ID changes
  useEffect(() => {
    if (activeRoomId) {
      console.log(`Active room ID changed to: ${activeRoomId}, refreshing data...`);
      refreshRoomPreferences(activeRoomId).catch(error => {
        console.error(`Failed to refresh room preferences for ${activeRoomId}:`, error);
      });
    }
  }, [activeRoomId, refreshRoomPreferences]);
  
  // Debug to check room preferences changes
  useEffect(() => {
    console.log("Room preferences updated:", Object.keys(roomPreferences).length);
    if (activeRoomId && roomPreferences[activeRoomId]) {
      const prefs = roomPreferences[activeRoomId];
      console.log(`Active room ${activeRoomId} has:`, {
        inspirationImages: prefs?.inspirationImages?.length || 0,
        pinterestBoards: prefs?.pinterestBoards?.length || 0
      });
    }
  }, [roomPreferences, activeRoomId]);
  
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
      
      console.log(`TabsTrigger ${area.area} - value: ${normalizedArea}`);
      
      return (
        <TabsTrigger
          key={area.area}
          value={normalizedArea} 
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
      
      console.log(`TabsContent ${area.area} - value: ${normalizedArea}`);
      console.log(`Room ID for area ${area.area}: ${roomId}`);
      console.log(`Room preferences for ${area.area}:`, roomPreference);
      
      return (
        <TabsContent
          key={area.area}
          value={normalizedArea}
          className="py-4"
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
            onAddInspirationImages={(images) => handlers.handleAddRoomInspirationImages(images, roomId)}
            onAddPinterestBoards={(boards, room) => handlers.handleAddRoomPinterestBoards(boards, room, roomId)}
          />
        </TabsContent>
      );
    });
  };
  
  console.log(`Current active tab: ${activeTab}`);
  
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
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="mb-4 border border-gray-200 p-1 rounded-lg overflow-x-auto flex w-full bg-white">
            {generateTabs()}
          </TabsList>
          
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
