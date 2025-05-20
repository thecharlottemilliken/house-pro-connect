
import React, { useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import ProjectDesignTabs from "@/components/project/design/ProjectDesignTabs";
import { useCallback } from 'react';

interface ProjectDesignContentProps {
  projectData: any;
  propertyDetails: any;
  isMobile: boolean;
  defaultTab: string;
  renovationAreas: any[];
  designPreferences: any;
  roomPreferences: any;
  propertyPhotos: any[];
  getRoomIdByName: (name: string) => string | undefined;
  enhancedHandlers: {
    enhancedSelectBeforePhotos: (area: string, photos: string[]) => Promise<any>;
    enhancedUploadBeforePhotos: (area: string, photos: string[]) => Promise<any>;
    enhancedUpdateAssetTags: (index: number, tags: string[]) => Promise<any>;
    enhancedSaveMeasurements: (area: string, measurements: any) => Promise<any>;
    enhancedAddProjectFiles: (area: string, files: string[]) => Promise<any>;
    refreshTrigger: number;
  };
  handlers: {
    handleAddDesigner: () => void;
    handleAddRenderings: () => void;
    handleAddDrawings: () => void;
    handleAddBlueprints: () => void;
    handleRemoveDesignAsset: (index: number, designPreferences: any) => Promise<any>;
    handleAddInspirationImages: (images: any, designPreferences: any) => Promise<any>;
    handleAddPinterestBoards: (boards: any[], designPreferences: any) => Promise<any>;
    handleAddRoomInspirationImages: (images: any, roomId?: string) => Promise<any>;
    handleAddRoomPinterestBoards: (boards: any[], roomName: string, roomId?: string) => Promise<any>;
  };
}

const ProjectDesignContent: React.FC<ProjectDesignContentProps> = ({
  projectData,
  propertyDetails,
  isMobile,
  defaultTab,
  renovationAreas,
  designPreferences,
  roomPreferences,
  propertyPhotos,
  getRoomIdByName,
  enhancedHandlers,
  handlers
}) => {
  const {
    enhancedSelectBeforePhotos,
    enhancedUploadBeforePhotos,
    enhancedUpdateAssetTags,
    enhancedSaveMeasurements,
    enhancedAddProjectFiles,
    refreshTrigger
  } = enhancedHandlers;

  const {
    handleAddDesigner,
    handleAddRenderings,
    handleAddDrawings,
    handleAddBlueprints,
    handleRemoveDesignAsset,
    handleAddInspirationImages,
    handleAddPinterestBoards,
    handleAddRoomInspirationImages,
    handleAddRoomPinterestBoards,
  } = handlers;

  // Debug log to check for before photos in design preferences
  useEffect(() => {
    console.log("ProjectDesign - Design preferences:", projectData.design_preferences);
    if (projectData.design_preferences?.beforePhotos) {
      console.log("ProjectDesign - Before photos in design preferences:", projectData.design_preferences.beforePhotos);
    } else {
      console.log("ProjectDesign - No before photos found in design preferences");
    }
  }, [projectData.design_preferences]);

  return (
    <div className="flex flex-col bg-white min-h-screen">
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

export default ProjectDesignContent;
