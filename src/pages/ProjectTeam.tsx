
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw, UserCheck } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { toast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import TeamMemberList from "@/components/project/team/TeamMemberList";
import TeamMemberInviteDialog from "@/components/project/team/TeamMemberInviteDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addTeamMember } from "@/utils/team";

const ProjectTeam = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingCoach, setIsAddingCoach] = useState(false);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
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

  // Function to ensure the project owner is in the team
  const ensureOwnerInTeam = async () => {
    if (!projectId || !user || isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // First check if project exists and who the owner is
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .maybeSingle();
        
      if (projectError) {
        throw projectError;
      }
      
      if (!projectData) {
        toast({
          title: "Project Not Found",
          description: "Could not find the specified project.",
          variant: "destructive"
        });
        setIsRefreshing(false);
        return;
      }
      
      const projectOwnerId = projectData.user_id;
      console.log("Project owner ID:", projectOwnerId);
      
      // Check if owner is already in team
      const { data: existingMember, error: checkError } = await supabase
        .from('project_team_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', projectOwnerId)
        .eq('role', 'owner')
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      // If owner is not in team, add them
      if (!existingMember) {
        console.log("Owner not found in team, adding...");
        
        // Get the owner's profile information
        const { data: ownerProfile, error: profileError } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', projectOwnerId)
          .maybeSingle();
          
        if (profileError) {
          throw profileError;
        }
        
        if (!ownerProfile || !ownerProfile.email) {
          throw new Error("Could not find owner profile information");
        }
        
        // Use the addTeamMember utility function which handles RLS properly
        const result = await addTeamMember(
          projectId,
          ownerProfile.email,
          'owner',
          ownerProfile.name
        );
        
        if (result.success) {
          toast({
            title: "Owner Added",
            description: "Project owner has been added to the team."
          });
        } else {
          throw new Error(result.error || "Failed to add owner to team");
        }
      } else {
        toast({
          title: "Team Verified",
          description: "Project owner is already a team member."
        });
      }
      
      // Refresh the team list
      await refetchTeamMembers();
      
    } catch (error: any) {
      console.error("Error ensuring owner in team:", error);
      toast({
        title: "Error",
        description: `Failed to verify team: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to add coaches to this specific project
  const addCoachesToProject = async () => {
    if (!projectId || isAddingCoach) return;
    
    setIsAddingCoach(true);
    
    try {
      // Call the database function to add coaches to the project
      const { error } = await supabase.functions.invoke(
        'add-coaches-to-projects',
        {
          body: { projectId }  // Passing project ID to only update this specific project
        }
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Coaches Added",
        description: "Coaches have been added to this project."
      });
      
      // Refresh the team list to show the newly added coaches
      refetchTeamMembers();
      
    } catch (error: any) {
      console.error("Error adding coaches:", error);
      toast({
        title: "Error",
        description: `Failed to add coaches: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsAddingCoach(false);
    }
  };

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
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Button 
                  variant="outline"
                  onClick={addCoachesToProject}
                  disabled={isAddingCoach}
                  className="flex items-center"
                >
                  <UserCheck className={`mr-2 h-4 w-4 ${isAddingCoach ? 'animate-spin' : ''}`} />
                  {isAddingCoach ? 'ADDING COACHES...' : 'ADD COACHES'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={ensureOwnerInTeam}
                  disabled={isRefreshing}
                  className="flex items-center"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'REFRESHING...' : 'REFRESH TEAM'}
                </Button>
                <Button 
                  className="bg-[#0f566c] hover:bg-[#0d4a5d]"
                  onClick={openInviteDialog}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  INVITE A TEAM MEMBER
                </Button>
              </div>
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
