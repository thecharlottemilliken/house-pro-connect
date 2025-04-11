
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Upload, Plus } from "lucide-react";

const ProjectDesign = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { projectData, isLoading } = useProjectData(params.projectId, location.state);
  const [selectedRoom, setSelectedRoom] = useState("Kitchen");
  
  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Unknown Project";
  
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Project Design
            </h1>
            
            {/* Select Room Section */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-700 mb-3">Select a room</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedRoom === "Kitchen" ? "default" : "outline"}
                  size="sm"
                  className={selectedRoom === "Kitchen" ? "bg-[#0f566c] hover:bg-[#0d4a5d]" : ""}
                  onClick={() => setSelectedRoom("Kitchen")}
                >
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    <span className="text-xs">🍳</span>
                  </div>
                  Kitchen
                </Button>
                <Button 
                  variant={selectedRoom === "Bathroom" ? "default" : "outline"}
                  size="sm"
                  className={selectedRoom === "Bathroom" ? "bg-[#0f566c] hover:bg-[#0d4a5d]" : ""}
                  onClick={() => setSelectedRoom("Bathroom")}
                >
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    <span className="text-xs">🚿</span>
                  </div>
                  Bathroom
                </Button>
              </div>
            </div>
            
            {/* Kitchen Design Details */}
            <div className="border border-gray-200 rounded-lg p-5 mb-8">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold">{selectedRoom}</h2>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Designer:</p>
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <span className="text-xs">👤</span>
                    </div>
                    <span>Don Smith</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Square Feet:</p>
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <span className="text-xs">📏</span>
                    </div>
                    <span>100 SQFT</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location:</p>
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <span className="text-xs">📍</span>
                    </div>
                    <span>First Floor</span>
                  </div>
                </div>
              </div>
              
              {/* Renderings Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Renderings</h3>
                  <Button variant="outline" size="sm">
                    Manage Photos
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-100 aspect-video rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                      alt="Kitchen rendering" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gray-100 aspect-video rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                      alt="Kitchen rendering" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              
              {/* Files Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Files</h3>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <div className="mr-2 text-gray-500">📄</div>
                      <span>Blueprint.Dwg</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="mr-2 text-gray-500">📄</div>
                      <span>Designs.Dwg</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="mr-2 text-gray-500">📄</div>
                      <span>Specs.Pdf</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Designs</h3>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <div className="mr-2 text-gray-500">📄</div>
                      <span>Blueprint.Dwg</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="mr-2 text-gray-500">📄</div>
                      <span>Designs.Dwg</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="mr-2 text-gray-500">📄</div>
                      <span>Specs.Pdf</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Before Photos Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Before Photos</h2>
                <Button variant="outline" size="sm">
                  Manage Photos
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-100 aspect-square rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                    alt="Kitchen before" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gray-100 aspect-square rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                    alt="Kitchen before" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Upload Photos Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-2">Upload photos for Tile Milestone 1.</h2>
              <p className="text-gray-600 mb-4">
                It looks like you recently finished a project milestone, take some photos and upload them to capture the progress.
              </p>
              <Button className="bg-[#0f566c] hover:bg-[#0d4a5d]">
                <Upload className="h-4 w-4 mr-2" /> UPLOAD PHOTOS
              </Button>
            </div>
            
            {/* Inspiration Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Inspiration</h2>
                <Button variant="outline" size="sm">
                  Add Inspiration
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 aspect-square rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                    alt="Inspiration" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gray-100 aspect-square rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                    alt="Inspiration" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gray-100 aspect-square rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                    alt="Inspiration" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Recommended Content Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recommended Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-100">
                      <img 
                        src={`https://images.unsplash.com/photo-161648602${item}-aaa4789e8c9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80`}
                        alt="Recommended design" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm mb-2">Design a chic, functional home that showcases your personality.</p>
                      <Button variant="outline" size="sm" className="w-full text-center bg-gray-700 text-white border-gray-700 hover:bg-gray-800">
                        CHECK IT OUT
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDesign;
