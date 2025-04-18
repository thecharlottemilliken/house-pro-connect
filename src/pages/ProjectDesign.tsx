
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, Image as ImageIcon, Plus } from "lucide-react";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import EmptyDesignState from "@/components/project/design/EmptyDesignState";

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

  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Project Overview";
  
  // Initialize design preferences with defaults if not present
  const designPreferences = projectData.design_preferences || {
    hasDesigns: false,
    designers: [],
    designAssets: [],
    renderingImages: [],
    inspirationImages: []
  };
  
  // Check if we have design plans
  const hasDesigns = designPreferences?.hasDesigns || false;
  
  // Check if we have designers
  const designers = designPreferences?.designers || [];
  const hasDesigner = designers.length > 0;
  
  // Check if we have any design assets
  const designAssets = designPreferences?.designAssets || [];
  const hasDesignAssets = designAssets.length > 0;
  
  // Check if we have any renderings
  const renderingImages = designPreferences?.renderingImages || [];
  const hasRenderings = renderingImages.length > 0;
  
  // Check if we have any inspiration images
  const inspirationImages = designPreferences?.inspirationImages || [];
  const hasInspiration = inspirationImages.length > 0;

  // Default tab to first renovation area if available
  const defaultTab = projectData.renovation_areas?.length > 0 
    ? projectData.renovation_areas[0].area.toLowerCase()
    : "kitchen";

  // Mock actions for empty states - these would connect to real functionality
  const handleAddDesignPlans = () => {
    console.log("Add design plans clicked");
  };

  const handleAddDesigner = () => {
    console.log("Add designer clicked");
  };

  const handleUploadAssets = () => {
    console.log("Upload assets clicked");
  };

  const handleAddRenderings = () => {
    console.log("Add renderings clicked");
  };

  const handleAddInspiration = () => {
    console.log("Add inspiration clicked");
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
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
                    {projectData?.renovation_areas?.map((area, index) => (
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
                </Tabs>
              </div>

              {hasDesigns ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left side - Room details */}
                  <div className="col-span-1 lg:col-span-2">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold">{projectData?.renovation_areas?.[0]?.area || 'Room'}</h2>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                        
                        {hasDesigner ? (
                          <div className="space-y-4">
                            {designers.map((designer, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-gray-600">Designer:</span>
                                <div className="flex items-center">
                                  <div className="w-6 h-6 rounded-full bg-gray-300 mr-2"></div>
                                  <span>{designer.businessName}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <EmptyDesignState 
                            type="designer" 
                            onAction={handleAddDesigner}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Right side - Design assets */}
                  <div className="col-span-1 lg:col-span-3">
                    {!hasDesignAssets ? (
                      <EmptyDesignState 
                        type="design-assets" 
                        onAction={handleUploadAssets}
                      />
                    ) : (
                      <Card className="mb-6">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Design Assets</h2>
                            <Button variant="ghost" size="sm" className="uppercase text-xs">Manage Assets</Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {designAssets.map((asset, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="truncate">{asset.name}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
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
                            <Button variant="ghost" size="sm" className="uppercase text-xs">Manage Photos</Button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            {renderingImages.map((img, idx) => (
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
              
              {/* Inspiration Section */}
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
                    {inspirationImages.map((img, idx) => (
                      <div key={idx} className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img src={img} alt={`Inspiration ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDesign;
