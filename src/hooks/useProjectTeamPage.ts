
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useProjectData } from "@/hooks/useProjectData";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { toast } from "@/hooks/use-toast";

export const useProjectTeamPage = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  
  const { 
    projectData, 
    isLoading: isProjectLoading 
  } = useProjectData(params.projectId, location.state);

  const projectId = projectData?.id || params.projectId || "";
  const projectTitle = projectData?.title || "Unknown Project";

  const { 
    teamMembers, 
    isLoading: isTeamLoading 
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

  return {
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    projectId,
    projectTitle,
    teamMembers,
    isLoading: isProjectLoading || isTeamLoading
  };
};
