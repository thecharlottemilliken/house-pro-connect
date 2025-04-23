
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
        // First, check using the edge function
        const { data: isTeamMember, error: teamMemberError } = await supabase.functions.invoke(
          'check-team-membership',
          {
            body: { projectId, userId: user.id }
          }
        );

        if (teamMemberError) {
          console.error("Error checking team membership:", teamMemberError);
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        if (isTeamMember) {
          setHasAccess(true);
          
          // Try to get the role from team members
          try {
            // Try direct query first
            const { data: memberData, error: memberError } = await supabase
              .from('project_team_members')
              .select('role')
              .eq('project_id', projectId)
              .eq('user_id', user.id);
              
            if (memberError) {
              console.error("Error getting role:", memberError);
              throw memberError;
            }
            
            if (memberData && memberData.length > 0) {
              const userRole = memberData[0].role;
              setRole(userRole);
              setIsOwner(userRole === 'owner');
            }
          } catch (roleError) {
            console.error("Error getting role, using fallback:", roleError);
            
            // Try getting the project directly to check owner
            try {
              const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('user_id')
                .eq('id', projectId);
                
              if (projectError) {
                throw projectError;
              }
              
              if (projectData && projectData.length > 0) {
                const isProjectOwner = projectData[0].user_id === user.id;
                setIsOwner(isProjectOwner);
                setRole(isProjectOwner ? 'owner' : 'team');
              } else {
                setRole('team'); // Default to team member if we can't verify ownership
              }
            } catch (projectError) {
              console.error("Error getting project data:", projectError);
              setRole('team'); // Default to team member if all checks fail
            }
          }
        } else {
          setHasAccess(false);
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
