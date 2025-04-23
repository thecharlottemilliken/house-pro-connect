
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UseProjectAccessResult {
  hasAccess: boolean;
  isOwner: boolean;
  role: string | null;
  isLoading: boolean;
}

export const useProjectAccess = (projectId: string): UseProjectAccessResult => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!projectId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log(`Checking access for projectId: ${projectId} and userId: ${user.id}`);

        // First check if the user is the project owner or has team membership
        const { data: accessData, error: accessError } = await supabase.functions.invoke(
          'check-team-membership',
          {
            body: { projectId, userId: user.id }
          }
        );

        if (accessError) {
          console.error("Error checking access:", accessError);
          toast.error("Error checking project access. Please try again.");
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        console.log("Access check result:", accessData);
        
        // Set access based on the response from the edge function
        setHasAccess(!!accessData);
        
        if (accessData) {
          // If user has access, get their role
          try {
            const { data: projectData, error: projectError } = await supabase.functions.invoke(
              'handle-project-update',
              {
                body: { 
                  operation: "get-project-owner", 
                  projectId, 
                  userId: user.id 
                }
              }
            );

            if (projectError) {
              console.error("Error getting project data:", projectError);
              setRole('team');
            } else if (projectData) {
              console.log("Project role data:", projectData);
              
              // Check if user is the owner
              setIsOwner(!!projectData.isOwner);
              setRole(projectData.isOwner ? 'owner' : projectData.role || 'team');
            } else {
              // If we couldn't determine the role, default to team member
              console.log("No project role data returned, defaulting to team member");
              setRole('team');
            }
          } catch (roleError) {
            console.error("Error determining user role:", roleError);
            setRole('team');
          }
        }
      } catch (error) {
        console.error("Error checking project access:", error);
        toast.error("Error checking project access. Please try again.");
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [projectId, user]);

  return { hasAccess, isOwner, role, isLoading };
};
