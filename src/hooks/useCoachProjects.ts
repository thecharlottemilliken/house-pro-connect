
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  title: string;
  created_at: string;
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
      
      // First fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          created_at,
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
      
      // Fetch property and owner details for each project
      const validProjects: Project[] = [];
      
      for (const project of projectsData) {
        try {
          // Get property details
          const { data: propertyData, error: propertyError } = await supabase
            .from('properties')
            .select(`
              property_name,
              address_line1,
              city,
              state
            `)
            .eq('id', project.property_id)
            .maybeSingle();
          
          if (propertyError || !propertyData) {
            console.error("Error fetching property:", propertyError || "Property not found");
            continue;
          }
          
          // Get owner details
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', project.user_id)
            .maybeSingle();
          
          if (ownerError || !ownerData) {
            console.error("Error fetching owner:", ownerError || "Owner not found");
            continue;
          }
          
          validProjects.push({
            id: project.id,
            title: project.title,
            created_at: project.created_at,
            property: propertyData,
            owner: ownerData
          });
        } catch (error) {
          console.error("Error processing project:", error);
          continue;
        }
      }
      
      console.log("Valid projects:", validProjects);
      setProjects(validProjects);
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
