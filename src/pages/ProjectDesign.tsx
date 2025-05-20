
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { useRoomDesign } from "@/hooks/useRoomDesign";
import { useDesignActions } from "@/hooks/useDesignActions";
import { useEffect, useCallback, useState } from "react";
import { useEnhancedDesignActions } from "@/hooks/useEnhancedDesignActions";
import ProjectDesignLoading from "@/components/project/design/ProjectDesignLoading";
import ProjectDesignContent from "@/components/project/design/ProjectDesignContent";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { normalizeAreaName } from '@/lib/utils';
import { toast } from "@/hooks/use-toast";

const ProjectDesign = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  
  // State to track active room ID for refreshing purposes
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(undefined);
  
  const {
    projectData,
    propertyDetails,
    isLoading,
    refreshProjectData
  } = useProjectData(params.projectId, location.state);
  
  const {
    propertyRooms,
    roomPreferences,
    defaultTab,
    setDefaultTab,
    fetchPropertyRooms,
    setupRooms,
    getRoomIdByName,
    refreshRoomPreferences,
    isRefreshing,
    lastRefreshedRoomId
  } = useRoomDesign(propertyDetails?.id);
  
  const {
    handleSaveMeasurements,
    handleSelectBeforePhotos,
    handleUploadBeforePhotos,
    handleAddProjectFiles,
    handleRemoveDesignAsset: originalHandleRemoveDesignAsset,
    handleUpdateAssetTags,
    handleAddPinterestBoards: originalHandleAddPinterestBoards,
    handleAddInspirationImages: originalHandleAddInspirationImages,
    handleAddRoomInspirationImages,
    handleAddRoomPinterestBoards
  } = useDesignActions(projectData?.id);

  // Event handlers
  const handleAddDesigner = useCallback(() => console.log("Add designer clicked"), []);
  const handleAddRenderings = useCallback(() => console.log("Add renderings clicked"), []);
  const handleAddDrawings = useCallback(() => console.log("Add drawings clicked"), []);
  const handleAddBlueprints = useCallback(() => console.log("Add blueprints clicked"), []);
  
  // Create a wrapper for handleRemoveDesignAsset that matches the expected signature
  const handleRemoveDesignAsset = useCallback((index: number) => {
    return originalHandleRemoveDesignAsset(index, projectData?.design_preferences || {});
  }, [originalHandleRemoveDesignAsset, projectData?.design_preferences]);

  // Create a wrapper for handleAddInspirationImages that matches the expected signature
  const handleAddInspirationImages = useCallback((images: string[]) => {
    return originalHandleAddInspirationImages(images, projectData?.design_preferences || {});
  }, [originalHandleAddInspirationImages, projectData?.design_preferences]);

  // Create a wrapper for handleAddPinterestBoards that matches the expected signature
  const handleAddPinterestBoards = useCallback((boards: any[], room: string) => {
    return originalHandleAddPinterestBoards(boards, projectData?.design_preferences || {});
  }, [originalHandleAddPinterestBoards, projectData?.design_preferences]);

  // Enhanced wrapper for handleAddRoomInspirationImages with refreshing
  const handleAddRoomInspirationImagesWithRefresh = useCallback(async (images: string[], roomId?: string) => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Unable to add inspiration images. Room ID is missing.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Adding ${images.length} inspiration images to room ID: ${roomId}`);
    
    try {
      await handleAddRoomInspirationImages(images, roomId);
      console.log(`Successfully added images, now refreshing room ID: ${roomId}`);
      setActiveRoomId(roomId); // Update active room ID to trigger refresh
      await refreshRoomPreferences(roomId);
    } catch (error) {
      console.error("Error adding inspiration images:", error);
      toast({
        title: "Error",
        description: "Failed to save inspiration images. Please try again.",
        variant: "destructive"
      });
    }
  }, [handleAddRoomInspirationImages, refreshRoomPreferences]);

  // Enhanced wrapper for handleAddRoomPinterestBoards with refreshing
  const handleAddRoomPinterestBoardsWithRefresh = useCallback(async (boards: any[], room: string, roomId?: string) => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Unable to add Pinterest boards. Room ID is missing.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Adding ${boards.length} Pinterest boards to room: ${room}, ID: ${roomId}`);
    
    try {
      await handleAddRoomPinterestBoards(boards, room, roomId);
      console.log(`Successfully added Pinterest boards, now refreshing room ID: ${roomId}`);
      setActiveRoomId(roomId); // Update active room ID to trigger refresh
      await refreshRoomPreferences(roomId);
    } catch (error) {
      console.error("Error adding Pinterest boards:", error);
      toast({
        title: "Error",
        description: "Failed to save Pinterest boards. Please try again.",
        variant: "destructive"
      });
    }
  }, [handleAddRoomPinterestBoards, refreshRoomPreferences]);

  // Use the enhanced actions hook
  const enhancedActions = useEnhancedDesignActions(
    handleSaveMeasurements,
    handleSelectBeforePhotos,
    handleUploadBeforePhotos,
    handleAddProjectFiles,
    handleUpdateAssetTags,
    projectData,
    refreshProjectData
  );

  // Set default tab based on renovation areas
  useEffect(() => {
    if (projectData?.renovation_areas?.length > 0) {
      const firstArea = projectData.renovation_areas[0];
      if (firstArea?.area) {
        // Use normalized area name for consistent tab values
        const normalizedArea = normalizeAreaName(firstArea.area);
        console.log(`Setting default tab to normalized value: ${normalizedArea} (from ${firstArea.area})`);
        setDefaultTab(normalizedArea);
        
        // Set active room ID based on the first area
        const roomId = getRoomIdByName(firstArea.area);
        if (roomId) {
          console.log(`Setting initial active room ID: ${roomId}`);
          setActiveRoomId(roomId);
        }
      }
    }
  }, [projectData?.renovation_areas, setDefaultTab, getRoomIdByName]);

  // Fetch property rooms
  useEffect(() => {
    if (propertyDetails?.id) {
      fetchPropertyRooms(propertyDetails.id);
    }
  }, [propertyDetails?.id, fetchPropertyRooms]);

  // Setup rooms based on renovation areas
  useEffect(() => {
    if (propertyDetails?.id && projectData?.renovation_areas) {
      setupRooms(propertyDetails.id, projectData.renovation_areas);
    }
  }, [propertyDetails?.id, projectData?.renovation_areas, setupRooms]);

  // Monitor refreshing state
  useEffect(() => {
    console.log(`Room data refreshing state: ${isRefreshing ? 'refreshing' : 'idle'}`);
    if (lastRefreshedRoomId) {
      console.log(`Last refreshed room: ${lastRefreshedRoomId}`);
    }
  }, [isRefreshing, lastRefreshedRoomId]);

  // Added logging to track data flow
  useEffect(() => {
    if (projectData?.design_preferences?.roomMeasurements) {
      console.log("Project room measurements:", projectData.design_preferences.roomMeasurements);
      console.log("Available measurement keys:", Object.keys(projectData.design_preferences.roomMeasurements));
      console.log("Current default tab:", defaultTab);
    }
    
    // Log room preferences data
    console.log("Current room preferences:", roomPreferences);
    if (activeRoomId && roomPreferences[activeRoomId]) {
      console.log(`Active room ${activeRoomId} data:`, roomPreferences[activeRoomId]);
      const inspirationImages = roomPreferences[activeRoomId]?.inspirationImages || [];
      console.log(`Inspiration images count: ${inspirationImages.length}`);
      if (inspirationImages.length > 0) {
        console.log("First few inspiration images:", inspirationImages.slice(0, 3));
      }
    }
  }, [projectData, enhancedActions.refreshTrigger, defaultTab, roomPreferences, activeRoomId]);

  if (isLoading || !projectData) {
    return <ProjectDesignLoading />;
  }

  const renovationAreas = projectData.renovation_areas || [];
  const propertyPhotos = propertyDetails?.home_photos || [];
  const designPreferences = projectData.design_preferences || { hasDesigns: false };

  const eventHandlers = {
    handleAddDesigner,
    handleAddRenderings,
    handleAddDrawings,
    handleAddBlueprints,
    handleRemoveDesignAsset,
    handleAddInspirationImages,
    handleAddPinterestBoards,
    handleAddRoomInspirationImages: handleAddRoomInspirationImagesWithRefresh,
    handleAddRoomPinterestBoards: handleAddRoomPinterestBoardsWithRefresh
  };

  return (
    <>
      <DashboardNavbar />
      <SidebarProvider>
        <div className="flex w-full">
          <ProjectSidebar 
            projectId={params.projectId || ''} 
            projectTitle={propertyDetails?.property_name || 'Project'} 
            activePage="design" 
          />
          <div className="flex-1">
            <ProjectDesignContent
              projectData={projectData}
              propertyDetails={propertyDetails}
              isMobile={isMobile}
              defaultTab={defaultTab}
              renovationAreas={renovationAreas}
              designPreferences={designPreferences}
              roomPreferences={roomPreferences}
              propertyPhotos={propertyPhotos}
              getRoomIdByName={getRoomIdByName}
              refreshRoomPreferences={refreshRoomPreferences}
              enhancedHandlers={enhancedActions}
              handlers={eventHandlers}
            />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default ProjectDesign;
