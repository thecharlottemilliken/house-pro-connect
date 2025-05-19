import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { useEffect, useCallback, useState } from "react";
import { useRoomDesign } from "@/hooks/useRoomDesign";
import { useDesignActions } from "@/hooks/useDesignActions";
import ProjectDesignTabs from "@/components/project/design/ProjectDesignTabs";
import { FileWithPreview } from "@/components/ui/file-upload";

const ProjectDesign = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  
  const {
    projectData,
    propertyDetails,
    isLoading
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

  // Added state to track UI updates after tag changes
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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

  // Enhanced tag update handler to trigger UI refresh
  const enhancedUpdateAssetTags = useCallback(async (index: number, tags: string[]) => {
    console.log("ProjectDesign: Updating tags for asset at index", index, "with tags", tags);
    const updatedPrefs = await handleUpdateAssetTags(index, tags, projectData?.design_preferences || {});
    if (updatedPrefs) {
      // Force a UI refresh after successful tag update
      setRefreshTrigger(prev => prev + 1);
      // Force a re-render by updating projectData in some way (this would ideally be done with a proper state management solution)
      if (projectData) {
        console.log("Tags updated successfully, triggering UI refresh");
      }
    }
  }, [handleUpdateAssetTags, projectData]);

  // Enhanced measurements save handler with immediate state update and better type checking
  const enhancedSaveMeasurements = useCallback(async (area: string, measurements: any) => {
    console.log("ProjectDesign: Saving measurements for area", area, JSON.stringify(measurements, null, 2));
    
    // Ensure all numeric values are actually numbers
    const normalizedMeasurements = {
      ...measurements,
      length: typeof measurements.length === 'string' ? parseFloat(measurements.length) || undefined : measurements.length,
      width: typeof measurements.width === 'string' ? parseFloat(measurements.width) || undefined : measurements.width,
      height: typeof measurements.height === 'string' ? parseFloat(measurements.height) || undefined : measurements.height,
      unit: measurements.unit || 'ft'
    };
    
    console.log("ProjectDesign: Normalized measurements:", JSON.stringify(normalizedMeasurements, null, 2));
    
    const updatedPrefs = await handleSaveMeasurements(area, normalizedMeasurements, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Measurements saved successfully, updating UI");
      // Force a UI refresh after successful measurements update with slight delay to ensure DB consistency
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 100);
    }
    
    return updatedPrefs;
  }, [handleSaveMeasurements, projectData]);

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

  // Helper function to convert string URLs to FileWithPreview objects
  const convertUrlsToFileObjects = (urls: string[]): FileWithPreview[] => {
    if (!urls || !Array.isArray(urls)) return [];
    
    return urls.map(url => ({
      id: url,
      name: url.split('/').pop() || 'file',
      size: '0',
      type: 'image/jpeg',
      url,
      progress: 100,
      tags: [],
      status: 'complete'
    }));
  };

  // Added logging to track data flow
  useEffect(() => {
    if (projectData?.design_preferences?.designAssets) {
      console.log("Project design assets:", projectData.design_preferences.designAssets);
    }
  }, [projectData, refreshTrigger]);

  if (isLoading || !projectData) {
    return <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>;
  }

  const renovationAreas = projectData.renovation_areas || [];
  const propertyPhotos = propertyDetails?.home_photos || [];
  const designPreferences = projectData.design_preferences || { hasDesigns: false };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar projectId={projectData.id} projectTitle={projectData.title} activePage="design" />
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Project Design
              </h1>
              
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-3">Select a room</h2>
                
                <ProjectDesignTabs 
                  key={`design-tabs-${refreshTrigger}`} // Force re-render on measurements updates
                  defaultTab={defaultTab}
                  renovationAreas={renovationAreas}
                  designPreferences={designPreferences}
                  roomPreferences={roomPreferences}
                  propertyPhotos={propertyPhotos}
                  propertyBlueprint={propertyDetails?.blueprint_url || null}
                  propertyId={propertyDetails?.id}
                  projectId={projectData.id}
                  getRoomIdByName={getRoomIdByName}
                  onAddDesigner={handleAddDesigner}
                  onAddRenderings={handleAddRenderings}
                  onAddDrawings={handleAddDrawings}
                  onAddBlueprints={handleAddBlueprints}
                  onSaveMeasurements={enhancedSaveMeasurements}
                  onSelectBeforePhotos={(area, photos) => handleSelectBeforePhotos(area, photos, designPreferences)}
                  onUploadBeforePhotos={(area, photos) => handleUploadBeforePhotos(area, convertUrlsToFileObjects(photos), designPreferences)}
                  onAddProjectFiles={(area, files) => handleAddProjectFiles(area, files, designPreferences)}
                  onRemoveDesignAsset={(index) => handleRemoveDesignAsset(index, designPreferences)}
                  onUpdateAssetTags={enhancedUpdateAssetTags}
                  onAddInspirationImages={(images, roomId) => {
                    console.log("Adding inspiration images with roomId:", roomId);
                    if (roomId) {
                      // Use the room-specific function if roomId is provided
                      return handleAddRoomInspirationImages(images, roomId);
                    } else {
                      // Fallback to project-level if no roomId
                      return handleAddInspirationImages(images, designPreferences);
                    }
                  }}
                  onAddPinterestBoards={(boards, roomName, roomId) => {
                    console.log("Adding Pinterest boards with roomId:", roomId);
                    if (roomId) {
                      // Use the room-specific function if roomId is provided
                      return handleAddRoomPinterestBoards(boards, roomName, roomId);
                    } else {
                      // Fallback to project-level
                      return handleAddPinterestBoards(boards, designPreferences);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDesign;
