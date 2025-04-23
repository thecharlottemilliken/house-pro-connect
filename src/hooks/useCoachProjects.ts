
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
      console.log("Fetching projects as coach...");

      // Try direct query first using the new RLS policy
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

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        throw projectsError;
      }

      if (!projectsData || projectsData.length === 0) {
        console.log("No projects found");
        setProjects([]);
        setIsLoading(false);
        return;
      }

      console.log(`Found ${projectsData.length} projects`);

      const propertyIds = projectsData.map((project) => project.property_id);
      const userIds = projectsData.map((project) => project.user_id);

      // Get properties data
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

      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
        throw propertiesError;
      }

      // Get profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email
        `)
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Create maps for quick lookups
      const propertiesMap = new Map(propertiesData?.map(p => [p.id, p]));
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

      // Combine all data
      const processedProjects = projectsData.map(project => {
        const property = propertiesMap.get(project.property_id) || {
          property_name: "Unknown Property",
          address_line1: "Address not available",
          city: "Unknown",
          state: "Unknown"
        };

        const owner = profilesMap.get(project.user_id) || {
          id: project.user_id,
          name: `User ${project.user_id.substring(0, 6)}`,
          email: "email@unknown.com"
        };

        return {
          id: project.id,
          title: project.title,
          created_at: project.created_at,
          state: project.state,
          property,
          owner
        };
      });

      setProjects(processedProjects);
    } catch (error: any) {
      console.error("Error in useCoachProjects:", error);
      toast.error("Failed to load projects. Please try again.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { projects, isLoading, fetchProjects };
};
