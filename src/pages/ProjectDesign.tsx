import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData, DesignPreferences, RenovationArea } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyDesignState from "@/components/project/design/EmptyDesignState";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import RoomDetails from "@/components/project/design/RoomDetails";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

import DesignAssetsCard from "@/components/project/design/DesignAssetsCard";
import PinterestInspirationSection from "@/components/project/design/PinterestInspirationSection";
import { PinterestBoard } from "@/components/project/design/PinterestConnector";

const ProjectDesign = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { projectData, propertyDetails, isLoading } = useProjectData(params.projectId, location.state);
  
  if (isLoading || !projectData) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  console.log("Property details:", propertyDetails);
  console.log("Blueprint URL:", propertyDetails?.blueprint_url);

  const designPreferences = (projectData.design_preferences as unknown as DesignPreferences) || {
    hasDesigns: false,
    designers: [],
    designAssets: [],
    renderingImages: [],
    inspirationImages: [],
    pinterestBoards: [],
    beforePhotos: {},
    roomMeasurements: {}
  };

  const hasDesigns = designPreferences.hasDesigns;
  const hasRenderings = designPreferences.renderingImages && designPreferences.renderingImages.length > 0;
  const hasInspiration = designPreferences.inspirationImages && designPreferences.inspirationImages.length > 0;
  const pinterestBoards = designPreferences.pinterestBoards || [];
  
  const renovationAreas = (projectData.renovation_areas as unknown as RenovationArea[]) || [];
  const defaultTab = renovationAreas[0]?.area?.toLowerCase() || "kitchen";
  
  const propertyPhotos = propertyDetails?.home_photos || [];

  const handleAddDesignPlans = () => console.log("Add design plans clicked");
  const handleAddDesigner = () => console.log("Add designer clicked");
  const handleAddRenderings = () => console.log("Add renderings clicked");
  const handleAddDrawings = () => console.log("Add drawings clicked");
  const handleAddBlueprints = () => console.log("Add blueprints clicked");
  const handleAddInspiration = () => console.log("Add inspiration clicked");

  const handleAddInspirationImages = async (images: string[]) => {
    try {
      const updatedImages = [
        ...(designPreferences.inspirationImages || []),
        ...images
      ];
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        inspirationImages: updatedImages
      };
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectData.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Added ${images.length} inspiration images`,
      });
      
      // Update local state for immediate UI update
      designPreferences.inspirationImages = updatedImages;
      
    } catch (error: any) {
      console.error('Error adding inspiration images:', error);
      toast({
        title: "Error",
        description: "Failed to add inspiration images",
        variant: "destructive"
      });
    }
  };

  const handleAddPinterestBoards = async (boards: PinterestBoard[]) => {
    try {
      const currentBoards = designPreferences.pinterestBoards || [];
      
      // Filter out duplicates based on board ID
      const uniqueNewBoards = boards.filter(
        newBoard => !currentBoards.some(existingBoard => existingBoard.id === newBoard.id)
      );
      
      const updatedBoards = [...currentBoards, ...uniqueNewBoards];
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        pinterestBoards: updatedBoards
      };
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectData.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Added ${uniqueNewBoards.length} Pinterest boards`,
      });
      
      // Update local state for immediate UI update
      designPreferences.pinterestBoards = updatedBoards;
      
    } catch (error: any) {
      console.error('Error adding Pinterest boards:', error);
      toast({
        title: "Error",
        description: "Failed to add Pinterest boards",
        variant: "destructive"
      });
    }
  };

  const handleSelectBeforePhotos = async (area: string, selectedPhotos: string[]) => {
    try {
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      
      const updatedBeforePhotos = { 
        ...(designPreferences.beforePhotos || {}),
        [areaKey]: selectedPhotos
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        beforePhotos: updatedBeforePhotos
      };
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectData.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Selected photos added to ${area}`,
      });
      
    } catch (error: any) {
      console.error('Error updating before photos:', error);
      toast({
        title: "Error",
        description: "Failed to save selected photos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUploadBeforePhotos = async (area: string, uploadedPhotos: string[]) => {
    try {
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      
      const existingPhotos = designPreferences.beforePhotos?.[areaKey] || [];
      
      const updatedBeforePhotos = { 
        ...(designPreferences.beforePhotos || {}),
        [areaKey]: [...existingPhotos, ...uploadedPhotos]
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        beforePhotos: updatedBeforePhotos
      };
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectData.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Uploaded photos added to ${area}`,
      });
      
    } catch (error: any) {
      console.error('Error updating before photos:', error);
      toast({
        title: "Error",
        description: "Failed to save uploaded photos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveMeasurements = async (area: string, measurements: any) => {
    try {
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      
      const updatedMeasurements = { 
        ...(designPreferences.roomMeasurements || {}),
        [areaKey]: measurements
      };
      
      const updatedDesignPreferences: Record<string, unknown> = {
        ...designPreferences,
        roomMeasurements: updatedMeasurements
      };
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          design_preferences: updatedDesignPreferences as Json
        })
        .eq('id', projectData.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Measurements saved for ${area}`,
      });
      
    } catch (error: any) {
      console.error('Error updating room measurements:', error);
      toast({
        title: "Error",
        description: "Failed to save measurements. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectData.id} 
            projectTitle={projectData.title}
            activePage="design"
          />
          
          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Project Design
              </h1>
              
              {propertyDetails?.blueprint_url && (
                <div className="p-2 mb-4 bg-gray-100 rounded text-xs">
                  <p>Debug: Blueprint URL: {propertyDetails.blueprint_url}</p>
                </div>
              )}
              
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-3">Select a room</h2>
                <Tabs defaultValue={defaultTab} className="w-full">
                  <TabsList className="mb-4">
                    {renovationAreas.map((area, index) => (
                      <TabsTrigger 
                        key={area.area} 
                        value={area.area.toLowerCase()}
                        className="flex items-center gap-2"
                      >
                        <span className={`w-5 h-5 flex items-center justify-center ${index === 0 ? 'bg-[#174c65] text-white' : 'bg-gray-300 text-gray-600'} rounded-full text-xs`}>
                          {index + 1}
                        </span>
                        {area.area}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {renovationAreas.map((area) => {
                    const areaKey = area.area.toLowerCase().replace(/\s+/g, '_');
                    const beforePhotos = designPreferences.beforePhotos?.[areaKey] || [];
                    const measurements = designPreferences.roomMeasurements?.[areaKey];
                    
                    return (
                      <TabsContent key={area.area} value={area.area.toLowerCase()} className="w-full">
                        {hasDesigns ? (
                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
                            <div className="col-span-1 lg:col-span-2 w-full">
                              <RoomDetails
                                area={area.area}
                                location={area.location}
                                designers={designPreferences.designers}
                                designAssets={designPreferences.designAssets}
                                measurements={measurements}
                                onAddDesigner={() => console.log("Add designer clicked")}
                                onUploadAssets={() => console.log("Upload assets clicked")}
                                onSaveMeasurements={(newMeasurements) => handleSaveMeasurements(area.area, newMeasurements)}
                                propertyPhotos={propertyPhotos}
                                onSelectBeforePhotos={(photos) => handleSelectBeforePhotos(area.area, photos)}
                                onUploadBeforePhotos={(photos) => handleUploadBeforePhotos(area.area, photos)}
                                beforePhotos={beforePhotos}
                              />
                            </div>
                            
                            <div className="col-span-1 lg:col-span-3 w-full">
                              <DesignAssetsCard
                                hasRenderings={hasRenderings}
                                renderingImages={designPreferences.renderingImages}
                                onAddRenderings={handleAddRenderings}
                                onAddDrawings={handleAddDrawings}
                                onAddBlueprints={handleAddBlueprints}
                                propertyBlueprint={propertyDetails?.blueprint_url || null}
                                propertyId={propertyDetails?.id}
                              />
                            </div>
                          </div>
                        ) : (
                          <EmptyDesignState 
                            type="no-designs" 
                            onAction={handleAddDesignPlans}
                          />
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
              
              <div className="mt-8 w-full">
                <PinterestInspirationSection 
                  inspirationImages={designPreferences.inspirationImages || []}
                  pinterestBoards={pinterestBoards}
                  onAddInspiration={handleAddInspirationImages}
                  onAddPinterestBoards={handleAddPinterestBoards}
                />
              </div>

              <div className="mt-8 w-full">
                <RecommendedContent />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDesign;
