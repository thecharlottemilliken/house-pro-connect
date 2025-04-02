
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import ProjectManageTabs from "@/components/project/manage/ProjectManageTabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";

const ProjectManage = () => {
  const location = useLocation();
  const params = useParams();
  const { projectData, isLoading } = useProjectData(params.projectId, location.state);
  
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
      
      <SidebarProvider defaultOpen={true}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="manage"
          />
          
          <div className="flex-1 p-8 bg-white overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Project
              </h1>
              <div className="flex gap-4">
                <Button variant="outline" className="border border-gray-300">
                  VIEW SOW
                </Button>
                <Button className="bg-[#0f566c] hover:bg-[#0d4a5d]">
                  REQUEST CHANGES
                </Button>
              </div>
            </div>
            
            {/* Project Management Tabs */}
            <ProjectManageTabs defaultTab="phases" />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectManage;
