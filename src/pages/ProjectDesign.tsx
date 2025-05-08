
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import { useEffect, useCallback } from "react";
import { useRoomDesign } from "@/hooks/useRoomDesign";
import { useDesignActions } from "@/hooks/useDesignActions";
import ProjectDesignTabs from "@/components/project/design/ProjectDesignTabs";

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
  
  const {
    handleSaveMeasurements,
    handleSelectBeforePhotos,
    handleUploadBeforePhotos,
    handleAddProjectFiles,
    handleRemoveDesignAsset,
    handleUpdateAssetTags,
    handleAddPinterestBoards,
    handleAddInspirationImages
  } = useDesignActions(projectData?.id);

  // Event handlers
  const handleAddDesigner = useCallback(() => console.log("Add designer clicked"), []);
  const handleAddRenderings = useCallback(() => console.log("Add renderings clicked"), []);
  const handleAddDrawings = useCallback(() => console.log("Add drawings clicked"), []);
  const handleAddBlueprints = useCallback(() => console.log("Add blueprints clicked"), []);

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
                  onSaveMeasurements={(area, measurements) => handleSaveMeasurements(area, measurements, designPreferences)}
                  onSelectBeforePhotos={(area, photos) => handleSelectBeforePhotos(area, photos, designPreferences)}
                  onUploadBeforePhotos={(area, photos) => handleUploadBeforePhotos(area, photos, designPreferences)}
                  onAddProjectFiles={(area, files) => handleAddProjectFiles(area, files, designPreferences)}
                  onRemoveDesignAsset={(index) => handleRemoveDesignAsset(index, designPreferences)}
                  onUpdateAssetTags={(index, tags) => handleUpdateAssetTags(index, tags, designPreferences)}
                  onAddInspirationImages={handleAddInspirationImages}
                  onAddPinterestBoards={handleAddPinterestBoards}
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
