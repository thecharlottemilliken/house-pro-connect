
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
      
      // First, check if the user is the project owner using a direct query
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("user_id")
        .eq("id", projectId)
        .maybeSingle();
        
      if (projectError) {
        console.error("Error checking project owner:", projectError);
        // Continue execution to try other methods
      }
      
      const projectOwnerId = projectData?.user_id;
      console.log("Project owner ID:", projectOwnerId);
      
      // Get team members with a direct query rather than using policies
      // that might cause recursion
      const { data: teamData, error: teamError } = await supabase
        .from("project_team_members")
        .select("id, role, email, name, user_id")
        .eq("project_id", projectId);
        
      if (teamError) {
        console.error("Error in fetching team data:", teamError);
        throw teamError;
      }

      // If no team data or empty, return empty array
      if (!teamData || teamData.length === 0) {
        console.log("No team members found, checking if owner needs to be added");
        
        // Add the owner if they're not already a team member
        if (projectOwnerId) {
          try {
            // Get owner profile to get email and name
            const { data: ownerProfile } = await supabase
              .from("profiles")
              .select("name, email")
              .eq("id", projectOwnerId)
              .maybeSingle();
              
            if (ownerProfile) {
              // Use the addTeamMember utility
              console.log("Adding owner to team:", ownerProfile.name, ownerProfile.email);
              const result = await addTeamMember(
                projectId,
                ownerProfile.email,
                "owner",
                ownerProfile.name
              );
              
              if (result.success) {
                // Return the owner as the only team member for now
                return [{
                  id: result.memberId || 'temp-id',
                  role: "owner",
                  name: ownerProfile.name || "Project Owner",
                  email: ownerProfile.email || "No email",
                  avatarUrl: `https://i.pravatar.cc/150?u=${ownerProfile.email}`,
                  isCurrentUser: projectOwnerId === user.id
                }];
              } else {
                console.error("Error adding owner to team:", result.error);
              }
            }
          } catch (err) {
            console.error("Error adding owner as team member:", err);
          }
        }
        
        return [];
      }
      
      // Get profile data using direct ID lookups rather than joins
      const userIds = teamData
        .map(member => member.user_id)
        .filter(Boolean);
        
      let profileMap = new Map();
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        } else if (profilesData) {
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
