
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectAccessResult {
  hasAccess: boolean;
  isOwner: boolean;
  role: string | null;
  isLoading: boolean;
  error: Error | null;
}

export const useProjectAccess = (projectId: string | undefined): ProjectAccessResult => {
  const { user } = useAuth();

  const checkProjectAccess = async (): Promise<{ 
    hasAccess: boolean; 
    isOwner: boolean; 
    role: string | null;
  }> => {
    if (!projectId || !user) {
      return { 
        hasAccess: false, 
        isOwner: false, 
        role: null
      };
    }

    try {
      // First check if the user is the project owner - this doesn't trigger recursion
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError) {
        console.error("Error checking project owner:", projectError);
        // Continue execution to try other methods
      } else if (projectData) {
        // If project data is found, check if user is owner
        const isOwner = projectData.user_id === user.id;
        
        if (isOwner) {
          console.log("User is project owner, granting access");
          return {
            hasAccess: true,
            isOwner: true,
            role: 'owner'
          };
        }
      }

      // Use edge function to check team membership without causing recursion
      try {
        const { data: isMember, error: membershipError } = await supabase.functions.invoke(
          'check-team-membership', {
            body: { projectId, userId: user.id }
          }
        );

        if (membershipError) {
          console.error("Membership function call failed:", membershipError);
        } else if (isMember) {
          console.log("User is team member via edge function check");
          
          // Get the role without joining tables to avoid recursion
          try {
            const { data: teamMember, error: roleError } = await supabase
              .from('project_team_members')
              .select('role')
              .eq('project_id', projectId)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (roleError) {
              console.error("Error getting role:", roleError);
            }
            
            return {
              hasAccess: true,
              isOwner: false, 
              role: teamMember?.role || null
            };
          } catch (roleError) {
            console.error("Error getting role:", roleError);
            
            // Still grant access even if role fetch fails
            return {
              hasAccess: true,
              isOwner: false,
              role: null
            };
          }
        }
      } catch (functionError) {
        console.error("Error calling team membership function:", functionError);
      }
      
      // Direct query as last resort
      try {
        const { data: directMember, error: directError } = await supabase
          .from('project_team_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (directError) {
          console.error("Direct team query failed:", directError);
          throw directError;
        }
        
        if (directMember) {
          console.log("User is team member via direct check");
          return {
            hasAccess: true,
            isOwner: directMember.role === 'owner',
            role: directMember.role
          };
        }
      } catch (directError) {
        console.error("Error in direct check:", directError);
      }

      // Default return if all checks fail
      return {
        hasAccess: false,
        isOwner: false,
        role: null
      };
    } catch (error) {
      console.error('Error checking project access:', error);
      throw error;
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['projectAccess', projectId, user?.id],
    queryFn: checkProjectAccess,
    enabled: !!projectId && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  return {
    hasAccess: data?.hasAccess || false,
    isOwner: data?.isOwner || false,
    role: data?.role || null,
    isLoading,
    error
  };
};
