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
import { normalizeAreaName } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Helper function to normalize area names for consistent key formatting
const normalizeAreaName = (area: string): string => {
  return area.toLowerCase().replace(/\s+/g, '_');
};

const ProjectDesign = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  
  const {
    projectData,
    propertyDetails,
    isLoading,
    refreshProjectData // Make sure we're exposing this function from useProjectData
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

  // Enhanced select before photos handler with improved debugging and refresh mechanism
  const enhancedSelectBeforePhotos = useCallback(async (area: string, photos: string[]) => {
    console.log(`ProjectDesign: Selecting ${photos.length} before photos for area ${area}`);
    console.log("Photos being selected:", photos);
    
    // Filter out any invalid photo URLs
    const validPhotos = photos.filter(url => url && typeof url === 'string');
    console.log("Valid photos being selected:", validPhotos);
    
    // Call the original handler
    const updatedPrefs = await handleSelectBeforePhotos(area, validPhotos, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Before photos updated successfully, triggering UI refresh");
      // Force a UI refresh after successful update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleSelectBeforePhotos, projectData?.design_preferences, refreshProjectData]);

  // Enhanced upload before photos handler with improved debugging and refresh mechanism
  const enhancedUploadBeforePhotos = useCallback(async (area: string, photos: string[]) => {
    console.log(`ProjectDesign: Uploading ${photos.length} before photos for area ${area}`);
    console.log("Photo URLs to upload:", photos);
    
    // Filter out any invalid photo URLs
    const validPhotos = photos.filter(url => url && typeof url === 'string');
    console.log("Valid photos being uploaded:", validPhotos);
    
    if (validPhotos.length === 0) {
      console.warn("No valid photos to upload");
      return null;
    }
    
    // Call the original handler
    const updatedPrefs = await handleUploadBeforePhotos(area, validPhotos, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Before photos uploaded successfully, triggering UI refresh");
      // Force a UI refresh after successful upload
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleUploadBeforePhotos, projectData?.design_preferences, refreshProjectData]);

  // Enhanced tag update handler to trigger UI refresh
  const enhancedUpdateAssetTags = useCallback(async (index: number, tags: string[]) => {
    console.log("ProjectDesign: Updating tags for asset at index", index, "with tags", tags);
    const updatedPrefs = await handleUpdateAssetTags(index, tags, projectData?.design_preferences || {});
    if (updatedPrefs) {
      // Force a UI refresh after successful tag update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    return updatedPrefs;
  }, [handleUpdateAssetTags, projectData?.design_preferences, refreshProjectData]);

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
      // Force a UI refresh after successful measurements update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleSaveMeasurements, projectData?.design_preferences, refreshProjectData]);

  // Enhanced project files handler that properly triggers UI updates
  const enhancedAddProjectFiles = useCallback(async (area: string, files: string[]) => {
    console.log(`ProjectDesign: Adding ${files.length} project files for area ${area}`);
    
    const updatedPrefs = await handleAddProjectFiles(area, files, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Project files added successfully, triggering UI refresh");
      // Force a UI refresh after successful file addition
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleAddProjectFiles, projectData?.design_preferences, refreshProjectData]);

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
    if (projectData?.design_preferences?.roomMeasurements) {
      console.log("Project room measurements:", projectData.design_preferences.roomMeasurements);
      console.log("Available measurement keys:", Object.keys(projectData.design_preferences.roomMeasurements));
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

  // Debug log to check for before photos in design preferences
  console.log("ProjectDesign - Design preferences:", projectData.design_preferences);
  if (projectData.design_preferences?.beforePhotos) {
    console.log("ProjectDesign - Before photos in design preferences:", projectData.design_preferences.beforePhotos);
  } else {
    console.log("ProjectDesign - No before photos found in design preferences");
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
                  key={`design-tabs-${refreshTrigger}`} // Force re-render on updates
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
                  onSelectBeforePhotos={(area, photos) => enhancedSelectBeforePhotos(area, photos)}
                  onUploadBeforePhotos={(area, photos) => enhancedUploadBeforePhotos(area, photos)}
                  onAddProjectFiles={(area, files) => enhancedAddProjectFiles(area, files)}
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
