
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData, DesignPreferences } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import EmptyDesignState from "@/components/project/design/EmptyDesignState";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import RoomDetails from "@/components/project/design/RoomDetails";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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

  const designPreferences: DesignPreferences = projectData.design_preferences || {
    hasDesigns: false,
    designers: [],
    designAssets: [],
    renderingImages: [],
    inspirationImages: [],
    beforePhotos: {}
  };

  const hasDesigns = designPreferences.hasDesigns;
  const hasRenderings = designPreferences.renderingImages && designPreferences.renderingImages.length > 0;
  const hasInspiration = designPreferences.inspirationImages && designPreferences.inspirationImages.length > 0;
  const defaultTab = projectData.renovation_areas?.[0]?.area.toLowerCase() || "kitchen";
  
  const propertyPhotos = propertyDetails?.home_photos || [];

  const handleAddDesignPlans = () => console.log("Add design plans clicked");
  const handleAddDesigner = () => console.log("Add designer clicked");
  const handleUploadAssets = () => console.log("Upload assets clicked");
  const handleAddRenderings = () => console.log("Add renderings clicked");
  const handleAddInspiration = () => console.log("Add inspiration clicked");

  const handleSelectBeforePhotos = async (area: string, selectedPhotos: string[]) => {
    try {
      const areaKey = area.toLowerCase().replace(/\s+/g, '_');
      
      // Create a new object to avoid modifying the original reference
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
      
      // Create a new object to avoid modifying the original reference
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
              
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-3">Select a room</h2>
                <Tabs defaultValue={defaultTab}>
                  <TabsList>
                    {projectData.renovation_areas?.map((area, index) => (
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

                  {projectData.renovation_areas?.map((area) => {
                    const areaKey = area.area.toLowerCase().replace(/\s+/g, '_');
                    const beforePhotos = designPreferences.beforePhotos?.[areaKey] || [];
                    
                    return (
                      <TabsContent key={area.area} value={area.area.toLowerCase()}>
                        {hasDesigns ? (
                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <RoomDetails
                              area={area.area}
                              location={area.location}
                              designers={designPreferences.designers}
                              designAssets={designPreferences.designAssets}
                              onAddDesigner={handleAddDesigner}
                              onUploadAssets={handleUploadAssets}
                              propertyPhotos={propertyPhotos}
                              onSelectBeforePhotos={(photos) => handleSelectBeforePhotos(area.area, photos)}
                              onUploadBeforePhotos={(photos) => handleUploadBeforePhotos(area.area, photos)}
                              beforePhotos={beforePhotos}
                            />
                            
                            <div className="col-span-1 lg:col-span-3">
                              {!hasRenderings ? (
                                <EmptyDesignState 
                                  type="renderings" 
                                  onAction={handleAddRenderings}
                                />
                              ) : (
                                <Card className="mb-6">
                                  <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                      <h2 className="text-xl font-bold">Renderings</h2>
                                      <Button variant="ghost" size="sm" className="uppercase text-xs">
                                        Manage Photos
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                      {designPreferences.renderingImages?.map((img, idx) => (
                                        <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                          <img src={img} alt={`Rendering ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
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
              
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Inspiration</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="uppercase text-xs"
                    onClick={handleAddInspiration}
                  >
                    Add Inspiration
                  </Button>
                </div>
                
                {!hasInspiration ? (
                  <EmptyDesignState 
                    type="inspiration" 
                    onAction={handleAddInspiration}
                  />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {designPreferences.inspirationImages?.map((img, idx) => (
                      <div key={idx} className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img src={img} alt={`Inspiration ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8">
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
