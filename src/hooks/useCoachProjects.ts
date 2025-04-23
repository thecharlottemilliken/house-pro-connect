
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const useCoachProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching projects for coach...");

      // Use edge function to get all projects directly (bypassing RLS)
      const { data: projectsData, error: edgeError } = await supabase.functions.invoke(
        'get-coach-projects',
        {
          body: {}
        }
      );

      if (edgeError) {
        console.error("Error fetching projects via edge function:", edgeError);
        throw edgeError;
      }

      if (projectsData && Array.isArray(projectsData.projects)) {
        console.log(`Found ${projectsData.projects.length} projects via edge function`);
        setProjects(projectsData.projects);
        setIsLoading(false);
        return;
      }

      // Fallback to direct query if edge function fails
      const { data, error } = await supabase
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

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No projects found");
        setProjects([]);
        setIsLoading(false);
        return;
      }

      const propertyIds = data.map((project) => project.property_id);
      const userIds = data.map((project) => project.user_id);

      // Fetch properties and user data
      const [propertiesResult, profilesMap] = await Promise.all([
        fetchProperties(propertyIds),
        fetchUserProfiles(userIds)
      ]);

      // Map projects with their properties and owner info
      const processedProjects: Project[] = data.map((project) => {
        const property = propertiesResult.get(project.property_id) || {
          property_name: "Unknown Property",
          address_line1: "Address not available",
          city: "Unknown",
          state: "Unknown",
        };

        const owner = profilesMap.get(project.user_id);
        const ownerData: ProfileInfo = owner || {
          id: project.user_id,
          name: `User ${project.user_id.substring(0, 6)}`,
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

      setProjects(processedProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async (propertyIds: string[]): Promise<Map<string, any>> => {
    const propertiesMap = new Map();
    try {
      const { data } = await supabase
        .from("properties")
        .select(`
          id, 
          property_name,
          address_line1,
          city,
          state
        `)
        .in("id", propertyIds);

      if (data) {
        data.forEach((property) => {
          propertiesMap.set(property.id, property);
        });
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
    return propertiesMap;
  };

  const fetchUserProfiles = async (userIds: string[]): Promise<Map<string, ProfileInfo>> => {
    const profilesMap = new Map<string, ProfileInfo>();
    
    try {
      // Approach 1: Try to fetch profiles directly
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      if (profilesData && profilesData.length > 0) {
        profilesData.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });
      }
      
      // If we couldn't get all profiles, try edge function for remaining users
      if (profilesMap.size < userIds.length) {
        const missingUserIds = userIds.filter(id => !profilesMap.has(id));
        
        const { data } = await supabase.functions.invoke('get-user-data', { 
          body: { user_ids: missingUserIds }
        });
        
        if (data && data.users) {
          data.users.forEach((user: any) => {
            profilesMap.set(user.id, {
              id: user.id,
              name: user.name || `User ${user.id.substring(0, 6)}`,
              email: user.email || "unknown@email.com"
            });
          });
        }
      }
    } catch (err) {
      console.error("Error fetching user profiles:", err);
    }
    
    return profilesMap;
  };

  return { projects, isLoading, fetchProjects };
};
