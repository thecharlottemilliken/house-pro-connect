
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export const useTeamMembers = (projectId: string | undefined) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchTeamMembers = async () => {
      setLoading(true);

      try {
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("user_id")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;

        const projectOwnerId = projectData?.user_id;

        const { data: teamData, error } = await supabase
          .from("project_team_members")
          .select("id, role, email, name, user_id")
          .eq("project_id", projectId);

        if (error) throw error;

        const userIds = teamData.map(member => member.user_id).filter(Boolean);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);
          
        if (profilesError) throw profilesError;
        
        const profileMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profileMap.set(profile.id, profile);
          });
        }
        
        const formatted: TeamMember[] = (teamData || []).map((member) => {
          const profile = profileMap.get(member.user_id);
          const name = profile?.name || member.name || "Unnamed";
          const email = profile?.email || member.email || "No email";
          const role = member.user_id === projectOwnerId ? "owner" : member.role;
          
          return {
            id: member.id,
            role: role,
            name: name,
            email: email,
            avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
          };
        });
          
        setTeamMembers(formatted);
      } catch (err) {
        console.error("Error in fetching team data:", err);
        toast({
          title: "Error",
          description: "Failed to load team data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [projectId, user?.id]);

  return { teamMembers, loading };
};
