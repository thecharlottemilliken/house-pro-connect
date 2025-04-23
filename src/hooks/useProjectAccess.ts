
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
      // First check if the user is the project owner
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError && projectError.code !== 'PGRST116') {
        console.error("Error checking project owner:", projectError);
        // Continue execution to try other methods
      }

      // If project data is found, check if user is owner
      if (projectData) {
        const isOwner = projectData.user_id === user.id;
        
        if (isOwner) {
          return {
            hasAccess: true,
            isOwner: true,
            role: 'owner'
          };
        }
      }

      // Use the security definer function to check team membership
      const { data: isMember, error: membershipError } = await supabase
        .rpc('safe_check_team_membership', { 
          p_project_id: projectId, 
          p_user_id: user.id 
        });

      if (membershipError) {
        console.warn("Membership function call failed:", membershipError);
        
        // Try another security definer function as a backup
        const { data: teamMembers, error: teamError } = await supabase
          .rpc('get_project_team_members', { p_project_id: projectId });
          
        if (teamError) {
          console.error("Team members function call failed:", teamError);
            
          // Direct query fallback - avoid joins which can cause recursion
          try {
            const { data: teamMember, error: directError } = await supabase
              .from('project_team_members')
              .select('role')
              .eq('project_id', projectId)
              .eq('user_id', user.id)
              .maybeSingle();

            if (directError) {
              console.error("Direct team member check failed:", directError);
            }

            return {
              hasAccess: !!teamMember,
              isOwner: false,
              role: teamMember?.role || null
            };
          } catch (directCheckError) {
            console.error("Error in direct check:", directCheckError);
          }
        } else if (teamMembers) {
          // Find the current user in the team members list
          const userMembership = teamMembers.find(m => m.user_id === user.id);
          
          if (userMembership) {
            return {
              hasAccess: true,
              isOwner: userMembership.role === 'owner',
              role: userMembership.role
            };
          }
        }
      } else {
        // If using the function was successful
        if (isMember) {
          // Get the role
          const { data: teamMember, error: teamError } = await supabase
            .from('project_team_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (teamError) {
            console.error("Error getting team member role:", teamError);
          }

          return {
            hasAccess: true,
            isOwner: teamMember?.role === 'owner',
            role: teamMember?.role || null
          };
        }
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
  });

  return {
    hasAccess: data?.hasAccess || false,
    isOwner: data?.isOwner || false,
    role: data?.role || null,
    isLoading,
    error
  };
};
