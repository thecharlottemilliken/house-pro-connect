
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
      console.log("JWT user metadata:", session?.user?.app_metadata);

      
      // First fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          created_at,
          state,
          user_id,
          property_id
        `)
        .order('created_at', { ascending: false });
      
      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        throw projectsError;
      }
      
      console.log("Projects data:", projectsData);
      
      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch all properties and profiles at once to reduce API calls
      const propertyIds = projectsData.map(project => project.property_id);
      const userIds = projectsData.map(project => project.user_id);
      
      console.log("User IDs to fetch:", userIds);
      
      // Fetch all properties in one call
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id, 
          property_name,
          address_line1,
          city,
          state
        `)
        .in('id', propertyIds);
      
      if (propertiesError) {
        console.error("Error fetching properties:", propertiesError);
        // Continue execution, we'll use default values for missing properties
      }
      
      // Fetch all profiles in one call - debug verbose
      console.log("Fetching profiles with user IDs:", userIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue execution, we'll use default values for missing profiles
      }
      
      console.log("Profiles data:", profilesData);
      
      // Create maps for faster lookups
      const propertiesMap = new Map();
      if (propertiesData) {
        propertiesData.forEach(property => {
          propertiesMap.set(property.id, property);
        });
      }
      
      const profilesMap = new Map();
      if (profilesData && profilesData.length > 0) {
        profilesData.forEach(profile => {
          console.log(`Adding profile to map: ${profile.id} -> ${profile.name}`);
          profilesMap.set(profile.id, profile);
        });
      } else {
        console.log("No profiles found - will use default values");
      }
      
      // Fallback - if profiles are still empty, try fetching each individually
      if ((!profilesData || profilesData.length === 0) && userIds.length > 0) {
        console.log("Attempting individual profile fetches as fallback");
        
        for (const userId of userIds) {
          const { data: singleProfile, error: singleProfileError } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', userId)
            .single();
          
          if (!singleProfileError && singleProfile) {
            console.log(`Found profile for user ${userId}:`, singleProfile);
            profilesMap.set(userId, singleProfile);
          } else {
            console.log(`No profile found for user ${userId}`);
          }
        }
      }
      
      // Process projects with the property and owner data
      const processedProjects: Project[] = projectsData.map(project => {
        // Get property data from the map or use default
        const property = propertiesMap.get(project.property_id) || {
          property_name: "Unknown Property",
          address_line1: "Address not available",
          city: "Unknown",
          state: "Unknown"
        };
        
        // Get owner data from the map or use default
        const owner = profilesMap.get(project.user_id) || {
          id: project.user_id,
          name: "Unknown User",
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
      
      console.log("Processed projects:", processedProjects);
      setProjects(processedProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { projects, isLoading, fetchProjects };
};
