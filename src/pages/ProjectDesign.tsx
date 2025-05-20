
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { useRoomDesign } from "@/hooks/useRoomDesign";
import { useDesignActions } from "@/hooks/useDesignActions";
import { useEffect, useCallback } from "react";
import { useEnhancedDesignActions } from "@/hooks/useEnhancedDesignActions";
import ProjectDesignLoading from "@/components/project/design/ProjectDesignLoading";
import ProjectDesignContent from "@/components/project/design/ProjectDesignContent";

const ProjectDesign = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  
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
    getRoomIdByName
  } = useRoomDesign(propertyDetails?.id);
  
  const {
    handleSaveMeasurements,
    handleSelectBeforePhotos,
    handleUploadBeforePhotos,
    handleAddProjectFiles,
    handleRemoveDesignAsset,
    handleUpdateAssetTags,
    handleAddPinterestBoards,
    handleAddInspirationImages,
    handleAddRoomInspirationImages,
    handleAddRoomPinterestBoards
  } = useDesignActions(projectData?.id);

  // Event handlers
  const handleAddDesigner = useCallback(() => console.log("Add designer clicked"), []);
  const handleAddRenderings = useCallback(() => console.log("Add renderings clicked"), []);
  const handleAddDrawings = useCallback(() => console.log("Add drawings clicked"), []);
  const handleAddBlueprints = useCallback(() => console.log("Add blueprints clicked"), []);

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
        setDefaultTab(firstArea.area.toLowerCase());
      }
    }
  }, [projectData?.renovation_areas, setDefaultTab]);

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

  // Added logging to track data flow
  useEffect(() => {
    if (projectData?.design_preferences?.roomMeasurements) {
      console.log("Project room measurements:", projectData.design_preferences.roomMeasurements);
      console.log("Available measurement keys:", Object.keys(projectData.design_preferences.roomMeasurements));
    }
  }, [projectData, enhancedActions.refreshTrigger]);

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
    handleAddRoomInspirationImages,
    handleAddRoomPinterestBoards
  };

  return (
    <>
      <DashboardNavbar />
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
        enhancedHandlers={enhancedActions}
        handlers={eventHandlers}
      />
    </>
  );
};

export default ProjectDesign;
