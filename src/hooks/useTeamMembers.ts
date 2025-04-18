
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export const useTeamMembers = (projectId: string | undefined) => {
  const fetchTeamMembers = async (): Promise<TeamMember[]> => {
    if (!projectId) return [];

    try {
      // Get project owner for later reference
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("user_id")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      const projectOwnerId = projectData?.user_id;

      // Get team members
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
        // Mark project owner as "owner" role
        const role = member.user_id === projectOwnerId ? "owner" : member.role;
        
        return {
          id: member.id,
          role: role,
          name: name,
          email: email,
          avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
        };
      });
          
      return formatted;
      
    } catch (err: any) {
      console.error("Error in fetching team data:", err);
      throw err;
    }
  };

  const { data: teamMembers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["teamMembers", projectId],
    queryFn: fetchTeamMembers,
    enabled: !!projectId,
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
