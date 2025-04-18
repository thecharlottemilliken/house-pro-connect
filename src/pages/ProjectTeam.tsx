
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { toast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import TeamMemberList from "@/components/project/team/TeamMemberList";
import TeamMemberInviteDialog from "@/components/project/team/TeamMemberInviteDialog";

const ProjectTeam = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { 
    projectData, 
    isLoading: isProjectLoading 
  } = useProjectData(params.projectId, location.state);

  const projectId = projectData?.id || params.projectId || "";
  const projectTitle = projectData?.title || "Unknown Project";

  const { 
    teamMembers, 
    isLoading: isTeamLoading, 
    refetch: refetchTeamMembers 
  } = useTeamMembers(projectId);

  useEffect(() => {
    if (!params.projectId) {
      toast({
        title: "Missing Project",
        description: "Please select a project from the projects list.",
        variant: "destructive"
      });
      navigate("/projects");
    }
  }, [params.projectId, navigate]);

  const openInviteDialog = () => {
    setIsInviteDialogOpen(true);
  };

  const closeInviteDialog = () => {
    setIsInviteDialogOpen(false);
  };

  if (!projectId) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Redirecting to projects...</div>
        </div>
      </div>
    );
  }

  if (isProjectLoading) {
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
          <ProjectSidebar projectId={projectId} projectTitle={projectTitle} activePage="team" />

          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">Project Team</h1>
              <Button 
                className="bg-[#0f566c] hover:bg-[#0d4a5d] w-full sm:w-auto"
                onClick={openInviteDialog}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                INVITE A TEAM MEMBER
              </Button>
            </div>

            <TeamMemberList 
              teamMembers={teamMembers} 
              isLoading={isTeamLoading} 
              projectId={projectId}
            />

            <TeamMemberInviteDialog
              projectId={projectId}
              isOpen={isInviteDialogOpen}
              onClose={closeInviteDialog}
            />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectTeam;
