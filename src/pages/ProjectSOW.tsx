
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { SOWWizard } from "@/components/project/sow/SOWWizard";
import { useProjectData } from "@/hooks/useProjectData";
import { useParams, useLocation } from "react-router-dom";

const ProjectSOW = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  
  const { projectData } = useProjectData(
    params.projectId,
    location.state
  );
  
  const projectId = projectData?.id || params.projectId || "";
  const projectTitle = projectData?.title || "Unknown Project";

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="manage"
          />
          
          <div className="flex-1 overflow-y-auto">
            <SOWWizard />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectSOW;
