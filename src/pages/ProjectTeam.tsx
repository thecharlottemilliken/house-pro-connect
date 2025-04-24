
import React from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import TeamMemberList from "@/components/project/team/TeamMemberList";
import TeamMemberInviteDialog from "@/components/project/team/TeamMemberInviteDialog";
import TeamPageLoading from "@/components/project/team/TeamPageLoading";
import TeamPageHeader from "@/components/project/team/TeamPageHeader";
import { useProjectTeamPage } from "@/hooks/useProjectTeamPage";

const ProjectTeam = () => {
  const isMobile = useIsMobile();
  const {
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    projectId,
    projectTitle,
    teamMembers,
    isLoading
  } = useProjectTeamPage();

  if (!projectId) {
    return <TeamPageLoading />;
  }

  if (isLoading) {
    return <TeamPageLoading />;
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />

      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar projectId={projectId} projectTitle={projectTitle} activePage="team" />

          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
            <TeamPageHeader onInviteClick={() => setIsInviteDialogOpen(true)} />

            <TeamMemberList 
              teamMembers={teamMembers} 
              isLoading={isLoading} 
              projectId={projectId}
            />

            <TeamMemberInviteDialog
              projectId={projectId}
              isOpen={isInviteDialogOpen}
              onClose={() => setIsInviteDialogOpen(false)}
            />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectTeam;
