
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, Image as ImageIcon } from "lucide-react";
import RecommendedContent from "@/components/dashboard/RecommendedContent";

const ProjectDesign = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { projectData, isLoading } = useProjectData(params.projectId, location.state);
  
  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Kitchen Project";
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  // Sample design assets
  const designAssets = [
    { name: "Blueprint.Dwg", icon: "file" },
    { name: "Designs.Dwg", icon: "file" },
    { name: "Specs.Pdf", icon: "file" },
    { name: "Prototype1.Png", icon: "image" },
  ];

  // Sample rendering images
  const renderingImages = [
    "/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png",
    "/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png",
    "/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png",
  ];

  // Sample inspiration images
  const inspirationImages = [
    "/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png",
    "/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png",
    "/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png",
  ];

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
                <Tabs defaultValue="kitchen">
                  <TabsList>
                    <TabsTrigger value="kitchen" className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-[#174c65] text-white rounded-full text-xs">1</span>
                      Kitchen
                    </TabsTrigger>
                    <TabsTrigger value="bathroom" className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-300 text-gray-600 rounded-full text-xs">2</span>
                      Bathroom
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left side - Kitchen details */}
                <div className="col-span-1 lg:col-span-2">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Kitchen</h2>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Designer:</span>
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-300 mr-2"></div>
                            <span>Don Smith</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Square Feet:</span>
                          <div className="flex items-center">
                            <span className="w-6 h-6 flex items-center justify-center mr-2">📏</span>
                            <span>100SQFT</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <div className="flex items-center">
                            <span className="w-6 h-6 flex items-center justify-center mr-2">📍</span>
                            <span>First Floor</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Renderings</h3>
                        <div className="flex justify-between">
                          <div className="grid grid-cols-2 gap-2">
                            {renderingImages.map((img, idx) => (
                              <div key={idx} className="aspect-video bg-gray-100 rounded overflow-hidden">
                                <img src={img} alt={`Rendering ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm">Manage Photos</Button>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">Design Assets</h3>
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            <span className="text-xl">+</span>
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {designAssets.map((asset, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <FileText className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="truncate">{asset.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right side - Measurement card */}
                <div className="col-span-1 lg:col-span-3">
                  <Card className="bg-[#174c65] text-white mb-6">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-2">Add your room measurements.</h2>
                      <p className="text-gray-200 mb-4">
                        Not sure how to get accurate measurements? No worries, we will walk 
                        you through it step-by-step.
                      </p>
                      <Button className="bg-white text-[#174c65] hover:bg-gray-100">
                        MEASURE ROOM
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Before Photos */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Before Photos</h2>
                        <Button variant="ghost" size="sm" className="uppercase text-xs">Manage Photos</Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                            <img 
                              src="/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png" 
                              alt={`Before ${i}`} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Upload Photos */}
                  <Card className="bg-gray-50 mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold">Upload photos for Tile Milestone 1.</h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        It looks like you recently finished a project milestone. Take some photos and upload 
                        them to capture the progress.
                      </p>
                      <Button variant="outline" className="bg-gray-200 border-gray-300">
                        UPLOAD PHOTOS
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Inspiration Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Inspiration</h2>
                  <Button variant="ghost" size="sm" className="uppercase text-xs">Add Inspiration</Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {inspirationImages.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <img src={img} alt={`Inspiration ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recommended Content */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Recommended Content</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <div className="aspect-video bg-gray-100">
                        <img 
                          src="/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png" 
                          alt={`Content ${i}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-700 mb-3">
                          Design a chic, functional home that showcases your personality.
                        </p>
                        <Button variant="outline" className="w-full bg-[#174c65] text-white hover:bg-[#174c65]/90 text-xs uppercase">
                          Check it out
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDesign;
