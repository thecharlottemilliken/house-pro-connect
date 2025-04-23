
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { addTeamMember } from "@/utils/team";

interface TeamMember {
  id: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string;
  isCurrentUser: boolean;
}

// Define the team member data structure that can come from different sources
interface TeamMemberData {
  id: string;
  project_id?: string;
  user_id: string;
  role: string;
  email: string;
  name: string;
  added_by?: string;
  added_at?: string;
}

export const useTeamMembers = (projectId: string | undefined) => {
  const { user } = useAuth();
  
  const fetchTeamMembers = async (): Promise<TeamMember[]> => {
    if (!projectId || !user) return [];

    try {
      console.log("Fetching team members for project:", projectId);
      
      // First, check if we're in project creation mode
      // In creation mode, we just treat current user as owner without querying the database
      // This requires checking if the project exists
      const { data: projectExists, error: projectCheckError } = await supabase
        .from("projects")
        .select("id, user_id")
        .eq("id", projectId)
        .maybeSingle();
        
      // If the project doesn't exist or this is a new project
      // or we couldn't verify existence, just return the current user as the owner
      if (projectCheckError || !projectExists) {
        console.log("Project in creation mode or check error, returning current user as owner");
        return [{
          id: 'owner-provisional',
          role: "owner",
          name: user.user_metadata?.name || "Project Owner",
          email: user.email || "No email",
          avatarUrl: `https://i.pravatar.cc/150?u=${user.email}`,
          isCurrentUser: true
        }];
      }
      
      // Check if current user is the project owner
      if (projectExists && projectExists.user_id === user.id) {
        console.log("User is project owner");
        
        // Add the user as owner immediately to avoid team members query
        return [{
          id: 'owner',
          role: "owner",
          name: user.user_metadata?.name || "Project Owner",
          email: user.email || "No email",
          avatarUrl: `https://i.pravatar.cc/150?u=${user.email}`,
          isCurrentUser: true
        }];
      }
      
      // If we reach here, we're dealing with an existing project
      // First try using the edge function
      let teamMemberData: TeamMemberData[] = [];
      
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'get-project-team-members', {
            body: { projectId }
          }
        );
        
        if (fnError || !data) {
          console.error("Error using team members function:", fnError);
          throw fnError;
        }
        
        teamMemberData = data;
      } catch (functionError) {
        console.error("Edge function failed:", functionError);
        
        // Fallback: Try direct query as a last resort
        try {
          const { data: directTeamData, error: directError } = await supabase
            .from("project_team_members")
            .select("id, role, email, name, user_id")
            .eq("project_id", projectId);
            
          if (directError) {
            console.error("Direct team query failed:", directError);
            throw directError;
          }
          
          teamMemberData = directTeamData || [];
        } catch (directQueryError) {
          console.error("Direct query failed:", directQueryError);
          
          // Since we already checked if user is owner above, return empty array
          return [];
        }
      }
      
      // Format team members with profile data where available
      const formatted: TeamMember[] = teamMemberData.map((member) => {
        const isCurrentUser = member.user_id === user.id;
        
        return {
          id: member.id,
          role: member.role,
          name: member.name || "Unnamed",
          email: member.email || "No email",
          avatarUrl: `https://i.pravatar.cc/150?u=${member.email}`,
          isCurrentUser: isCurrentUser
        };
      });
      
      console.log("Team members loaded:", formatted.length);
      return formatted;
      
    } catch (err: any) {
      console.error("Error in fetching team data:", err);
      throw err;
    }
  };

  const { data: teamMembers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["teamMembers", projectId],
    queryFn: fetchTeamMembers,
    enabled: !!projectId && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  if (error) {
    console.error("Error fetching team members:", error);
    toast({
      title: "Error",
      description: "Failed to load team data. Please try again.",
      variant: "destructive"
    });
  }

  return { 
    teamMembers, 
    isLoading, 
    refetch 
  };
};
