
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
        // Always use edge function to bypass RLS issues
        const { data: accessData, error: accessError } = await supabase.functions.invoke(
          'check-team-membership',
          {
            body: { projectId, userId: user.id }
          }
        );

        if (accessError) {
          console.error("Error checking access:", accessError);
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // Set access based on the response from the edge function
        setHasAccess(!!accessData);
        
        if (accessData) {
          // If user has access, get their role using handle-project-update
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
          } else if (projectData) {
            // Check if user is the owner
            const isProjectOwner = projectData.isOwner || projectData.user_id === user.id;
            setIsOwner(isProjectOwner);
            setRole(isProjectOwner ? 'owner' : projectData.role || 'team');
          }
          
          // If we couldn't determine the role, default to team member
          if (!role) {
            setRole('team');
          }
        }
      } catch (error) {
        console.error("Error checking project access:", error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [projectId, user]);

  return { hasAccess, isOwner, role, isLoading };
};
