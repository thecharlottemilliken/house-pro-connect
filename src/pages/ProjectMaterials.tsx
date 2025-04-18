
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import MaterialsSpecialtiesSidebar from "@/components/project/materials/MaterialsSpecialtiesSidebar";
import MaterialsStatusTabs from "@/components/project/materials/MaterialsStatusTabs";
import { Button } from "@/components/ui/button";

const ProjectMaterials = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const [activeSpecialty, setActiveSpecialty] = useState("Tile");
  const [activeStatus, setActiveStatus] = useState<"scheduled" | "delivered" | "wishlist">("scheduled");
  
  const { projectData, isLoading } = useProjectData(
    params.projectId,
    location.state
  );
  
  const projectId = projectData?.id || params.projectId || "";
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
            activePage="materials"
          />
          
          <div className="flex flex-1">
            <MaterialsSpecialtiesSidebar 
              activeSpecialty={activeSpecialty}
              setActiveSpecialty={setActiveSpecialty}
            />
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Materials</h1>
                  <p className="text-gray-500">Track and manage all project materials</p>
                </div>
                
                <Button className="mt-4 sm:mt-0 bg-[#0f566c] hover:bg-[#0d4a5d]">
                  Add Material
                </Button>
              </div>
              
              <MaterialsStatusTabs 
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
              />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectMaterials;
