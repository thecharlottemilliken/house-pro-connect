
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

export const useTeamMembers = (projectId: string | undefined) => {
  const { user } = useAuth();
  
  const fetchTeamMembers = async (): Promise<TeamMember[]> => {
    if (!projectId || !user) return [];

    try {
      console.log("Fetching team members for project:", projectId);
      
      // First, check if the user is the project owner
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("user_id")
        .eq("id", projectId)
        .maybeSingle();
        
      if (projectError) {
        console.error("Error checking project owner:", projectError);
      }
      
      const projectOwnerId = projectData?.user_id;
      console.log("Project owner ID:", projectOwnerId);
      
      // Get team members including their roles
      let { data: teamData, error: teamError } = await supabase
        .from("project_team_members")
        .select("id, role, email, name, user_id")
        .eq("project_id", projectId);
        
      if (teamError) {
        console.error("Error in fetching team data:", teamError);
        throw teamError;
      }

      // Check if owner exists in team
      const ownerExists = teamData?.some(member => 
        member.user_id === projectOwnerId && member.role === 'owner'
      ) || false;
      
      // If owner not found in team, try to add them using the utility function
      if (projectOwnerId && !ownerExists && teamData) {
        console.log("Owner not found in team, adding...");
        
        try {
          // Get owner profile to get email and name
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("id", projectOwnerId)
            .maybeSingle();
            
          if (ownerProfile) {
            // Use the addTeamMember utility which handles RLS properly
            const result = await addTeamMember(
              projectId,
              ownerProfile.email,
              "owner",
              ownerProfile.name
            );
            
            if (result.success) {
              // Re-fetch the team data after adding the owner
              const { data: refreshedData } = await supabase
                .from("project_team_members")
                .select("id, role, email, name, user_id")
                .eq("project_id", projectId);
                
              if (refreshedData && refreshedData.length > 0) {
                teamData = refreshedData;
              }
            } else {
              console.error("Error adding owner to team:", result.error);
            }
          } else {
            console.error("Could not find owner profile information");
          }
        } catch (insertErr) {
          console.error("Error in manual owner insertion:", insertErr);
        }
      }
      
      // If still no team data, return empty array
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
