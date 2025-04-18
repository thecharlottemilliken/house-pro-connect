
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TeamMember {
  id: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string;
  isCurrentUser: boolean;
}

export const useTeamMembers = (projectId: string | undefined) => {
  const { user } = useAuth();
  
  const fetchTeamMembers = async (): Promise<TeamMember[]> => {
    if (!projectId || !user) return [];

    try {
      console.log("Fetching team members for project:", projectId);
      
      // Get team members including their roles
      const { data: teamData, error: teamError } = await supabase
        .from("project_team_members")
        .select("id, role, email, name, user_id")
        .eq("project_id", projectId);
        
      if (teamError) {
        console.error("Error in fetching team data:", teamError);
        throw teamError;
      }

      if (!teamData || teamData.length === 0) return [];

      // Get profile data for all team members who have accounts
      const userIds = teamData
        .map(member => member.user_id)
        .filter(Boolean);
        
      let profileMap = new Map();
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);
          
        if (profilesError) throw profilesError;
        
        if (profilesData) {
          profilesData.forEach(profile => {
            profileMap.set(profile.id, profile);
          });
        }
      }
      
      // Format team members with profile data where available
      const formatted: TeamMember[] = teamData.map((member) => {
        const profile = profileMap.get(member.user_id);
        const name = profile?.name || member.name || "Unnamed";
        const email = profile?.email || member.email || "No email";
        const isCurrentUser = member.user_id === user.id;
        
        return {
          id: member.id,
          role: member.role,
          name: name,
          email: email,
          avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
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
