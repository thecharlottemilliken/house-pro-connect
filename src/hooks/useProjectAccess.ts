
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

      // If not owner, check if the user is a team member
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
