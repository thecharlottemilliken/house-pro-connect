
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

export const useCoachProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
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

      console.log("Project user IDs:", userIds);

      const { data: propertiesData } = await supabase
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

      // Get all profiles at once using the coach role permissions
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Try getting the user email from auth.users if available as a fallback
        await tryGetUserEmails(userIds, profilesData || []);
      }

      const profilesMap = new Map<string, ProfileInfo>();

      if (profilesData && profilesData.length > 0) {
        console.log("Found profile data for users:", profilesData.length);
        profilesData.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });
      } else {
        console.warn("No profiles found. This may indicate an RLS policy issue.");
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

      console.log("Processed projects:", processedProjects.length);
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

  // Helper function to try getting user emails directly if profiles fail
  const tryGetUserEmails = async (userIds: string[], existingProfiles: ProfileInfo[]) => {
    try {
      console.log("Attempting to get user emails using get_user_email function...");
      
      // Create a set of user IDs that already have profile data
      const existingProfileIds = new Set(existingProfiles.map(p => p.id));
      
      // Only fetch emails for users without profile data
      const userIdsToFetch = userIds.filter(id => !existingProfileIds.has(id));
      
      if (userIdsToFetch.length === 0) return;
      
      // Try to get user emails through the custom function
      for (const userId of userIdsToFetch) {
        const { data, error } = await supabase.rpc('get_user_email', { user_id: userId });
        
        if (error) {
          console.error(`Error fetching email for user ${userId}:`, error);
        } else if (data) {
          console.log(`Got email for user ${userId}:`, data);
        }
      }
    } catch (err) {
      console.error("Error in tryGetUserEmails:", err);
    }
  };

  return { projects, isLoading, fetchProjects };
};
