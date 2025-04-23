
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
        .single();

      if (projectError && projectError.code !== 'PGRST116') {
        throw projectError;
      }

      const isOwner = projectData?.user_id === user.id;
      
      if (isOwner) {
        return {
          hasAccess: true,
          isOwner: true,
          role: 'owner'
        };
      }

      // Use the security definer function to check team membership
      const { data: isMember, error: membershipError } = await supabase
        .rpc('safe_check_team_membership', { 
          p_project_id: projectId, 
          p_user_id: user.id 
        });

      if (membershipError) {
        console.warn("Membership function call failed:", membershipError);
        
        // Fallback to direct check
        const { data: teamMember, error: teamError } = await supabase
          .from('project_team_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (teamError) {
          throw teamError;
        }

        return {
          hasAccess: !!teamMember,
          isOwner: false,
          role: teamMember?.role || null
        };
      }

      // If using the function was successful
      if (isMember) {
        // We know they're a member, but we need to get their role
        const { data: teamMember, error: teamError } = await supabase
          .from('project_team_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (teamError) {
          throw teamError;
        }

        return {
          hasAccess: true,
          isOwner: false,
          role: teamMember?.role || null
        };
      }

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
