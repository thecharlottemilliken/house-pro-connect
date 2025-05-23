
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import ProjectManageTabs from "@/components/project/manage/ProjectManageTabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { supabase } from "@/integrations/supabase/client";

const ProjectManage = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { projectData, isLoading } = useProjectData(params.projectId, location.state);
  const [hasSOW, setHasSOW] = useState(false);
  
  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Unknown Project";
  
  // Check if SOW exists in the new statement_of_work table
  useEffect(() => {
    const checkSOW = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('statement_of_work')
          .select('id')
          .eq('project_id', projectId)
          .maybeSingle();
          
        if (error) throw error;
        setHasSOW(!!data);
      } catch (error) {
        console.error("Error checking SOW:", error);
      }
    };
    
    checkSOW();
  }, [projectId]);
  
  const handleViewSOW = () => {
    if (hasSOW) {
      navigate(`/project-sow/${projectId}?view=true`);
    } else {
      navigate(`/project-sow/${projectId}`);
    }
  };
  
  const handleRequestChanges = () => {
    navigate(`/project-sow/${projectId}`);
  };
  
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
            activePage="manage"
          />
          
          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">
                Manage Project
              </h1>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button 
                  variant="outline" 
                  className="border border-gray-300 w-full sm:w-auto"
                  onClick={handleViewSOW}
                >
                  {hasSOW ? "VIEW SOW" : "CREATE SOW"}
                </Button>
                {hasSOW && (
                  <Button 
                    className="bg-[#0f566c] hover:bg-[#0d4a5d] w-full sm:w-auto"
                    onClick={handleRequestChanges}
                  >
                    REQUEST CHANGES
                  </Button>
                )}
              </div>
            </div>
            
            {/* Project Management Tabs */}
            <ProjectManageTabs defaultTab="phases" />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default ProjectManage;
