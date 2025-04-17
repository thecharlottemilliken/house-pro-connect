import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  title: string;
  created_at: string;
  state: string;
  property: {
    property_name: string;
    address_line1: string;
    city: string;
    state: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProfileInfo {
  id: string;
  name: string;
  email: string;
}

interface UserEmailResult {
  email: string;
}

export const useCoachProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const session = await supabase.auth.getSession();
    console.log("JWT access token:", session.data.session?.access_token);
    console.log("Current user ID:", session.data.session?.user?.id);
    setIsLoading(true);
    try {
      console.log("Fetching projects...");

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          created_at,
          state,
          user_id,
          property_id
        `)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;
      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      const propertyIds = projectsData.map((project) => project.property_id);
      const userIds = projectsData.map((project) => project.user_id);

      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select(`
          id, 
          property_name,
          address_line1,
          city,
          state
        `)
        .in("id", propertyIds);

      const propertiesMap = new Map();
      if (propertiesData) {
        propertiesData.forEach((property) => {
          propertiesMap.set(property.id, property);
        });
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      const profilesMap = new Map<string, ProfileInfo>();

      if (profilesData && profilesData.length > 0) {
        profilesData.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });
      } else {
        for (const userId of userIds) {
          const { data: singleProfile, error: singleProfileError } = await supabase
            .from("profiles")
            .select("id, name, email")
            .eq("id", userId)
            .maybeSingle();

          if (singleProfile) {
            profilesMap.set(userId, singleProfile);
          } else {
            try {
              const { data: authData, error: authError } = await supabase
                .rpc<UserEmailResult[], { user_id: string }>("get_user_email", { user_id: userId });

              profilesMap.set(userId, {
                id: userId,
                name: `User ${userId.substring(0, 6)}`,
                email: authData?.[0]?.email ?? "email@unknown.com",
              });
            } catch (authErr) {
              profilesMap.set(userId, {
                id: userId,
                name: "Unknown User",
                email: "email@unknown.com",
              });
            }
          }
        }
      }

      const processedProjects: Project[] = projectsData.map((project) => {
        const property = propertiesMap.get(project.property_id) || {
          property_name: "Unknown Property",
          address_line1: "Address not available",
          city: "Unknown",
          state: "Unknown",
        };

        const owner = profilesMap.get(project.user_id);
        const ownerData: ProfileInfo = owner || {
          id: project.user_id,
          name: "Unknown User",
          email: "email@unknown.com",
        };

        return {
          id: project.id,
          title: project.title,
          created_at: project.created_at,
          state: project.state,
          property,
          owner: ownerData,
        };
      });

      console.table(
        processedProjects.map((p) => ({
          title: p.title,
          ownerName: p.owner.name,
          ownerEmail: p.owner.email,
        }))
      );

      setProjects(processedProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { projects, isLoading, fetchProjects };
};
