
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
  user_id?: string;
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
      
      // Use the edge function to get team members (including coaches)
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'get-project-team-members', {
            body: { projectId }
          }
        );
        
        if (fnError) {
          console.error("Error using team members function:", fnError);
          throw fnError;
        }
        
        if (!data || !Array.isArray(data)) {
          console.error("Invalid data returned from team members function");
          throw new Error("Invalid team members data");
        }
        
        console.log("Team members from edge function:", data);
        
        // Format team members with profile data
        const formatted: TeamMember[] = data.map((member) => {
          const isCurrentUser = member.user_id === user.id || member.id === user.id;
          
          // Make sure name and email exist
          const name = member.name || (member.role === 'coach' ? `Coach` : "Team Member");
          const email = member.email || "No email available";
          
          // Generate avatar from name or email, but ensure there's always a valid seed
          const avatarSeed = name !== "Coach" && name !== "Team Member" 
            ? name 
            : (email !== "No email available" ? email : `user-${member.id.substring(0, 8)}`);
          
          return {
            id: member.id,
            user_id: member.user_id,
            role: member.role,
            name: name,
            email: email,
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`,
            isCurrentUser: isCurrentUser
          };
        });
        
        console.log("Team members loaded:", formatted.length);
        return formatted;
        
      } catch (functionError) {
        console.error("Edge function failed:", functionError);
        
        // Fallback: Try direct query as a last resort
        console.log("Trying direct query fallback");
        
        let teamMemberData: TeamMember[] = [];
        
        // First check if current user is the project owner
        const { data: projectData } = await supabase
          .from("projects")
          .select("user_id")
          .eq("id", projectId)
          .maybeSingle();
          
        if (projectData?.user_id === user.id) {
          // Current user is owner
          teamMemberData.push({
            id: 'owner',
            role: "owner",
            name: user.user_metadata?.name || "Project Owner",
            email: user.email || "No email",
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
            isCurrentUser: true,
            user_id: user.id
          });
        }
        
        // Then get all team members
        const { data: directMembers, error: directError } = await supabase
          .from("project_team_members")
          .select("id, role, email, name, user_id")
          .eq("project_id", projectId);
          
        if (directError) {
          console.error("Direct team query failed:", directError);
          throw directError;
        }
        
        if (directMembers && directMembers.length > 0) {
          // Add team members
          directMembers.forEach(member => {
            // Check for duplicates - don't add if already in list
            const isDuplicate = teamMemberData.some(existingMember => 
              existingMember.user_id === member.user_id
            );
            
            if (!isDuplicate) {
              const isCurrentUser = member.user_id === user.id;
              
              // Ensure name and email exist
              const name = member.name || (member.role === 'coach' ? `Coach` : "Team Member");
              const email = member.email || "No email available";
              
              // Generate avatar from name or email, but ensure there's always a valid seed
              const avatarSeed = name !== "Coach" && name !== "Team Member" 
                ? name 
                : (email !== "No email available" ? email : `member-${member.id.substring(0, 8)}`);
              
              teamMemberData.push({
                id: member.id,
                role: member.role,
                name: name,
                email: email,
                avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`,
                isCurrentUser: isCurrentUser,
                user_id: member.user_id
              });
            }
          });
        }
        
        // If there are missing coach names/emails, add a fallback to retrieve them
        const membersWithMissingInfo = teamMemberData.filter(
          member => member.role === 'coach' && 
          (member.name === "Coach" || member.email === "No email available") && 
          member.user_id
        );
        
        if (membersWithMissingInfo.length > 0) {
          try {
            // Try to get user profile data from the user_data edge function
            const userIds = membersWithMissingInfo.map(member => member.user_id).filter(Boolean);
            
            if (userIds.length > 0) {
              const { data: userData, error: userError } = await supabase.functions.invoke(
                'get-user-data', {
                  body: { user_ids: userIds }
                }
              );
              
              if (!userError && userData && userData.users && Array.isArray(userData.users)) {
                // Update team members with the fetched user data
                userData.users.forEach(fetchedUser => {
                  teamMemberData = teamMemberData.map(member => {
                    if (member.user_id === fetchedUser.id) {
                      return {
                        ...member,
                        name: fetchedUser.name || member.name,
                        email: fetchedUser.email || member.email,
                        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fetchedUser.name || fetchedUser.email || member.id)}`
                      };
                    }
                    return member;
                  });
                });
              }
            }
          } catch (profileError) {
            console.error("Error fetching additional user data:", profileError);
          }
        }
        
        return teamMemberData;
      }
    } catch (err: any) {
      console.error("Error in fetching team data:", err);
      throw err;
    }
  };

  const { data: teamMembers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["teamMembers", projectId],
    queryFn: fetchTeamMembers,
    enabled: !!projectId && !!user,
    staleTime: 1000 * 60, // 1 minute
    retry: 2
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
