
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
      
      // Fetch property and owner details for each project
      const processedProjects: Project[] = [];
      
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
          
          // Default property data if not found
          const property = propertyData || {
            property_name: "Unknown Property",
            address_line1: "Address not available",
            city: "Unknown",
            state: "Unknown"
          };
          
          // Get owner details
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', project.user_id)
            .maybeSingle();
          
          // Default owner data if not found
          const owner = ownerData || {
            id: project.user_id,
            name: "Unknown User",
            email: "email@unknown.com"
          };
          
          processedProjects.push({
            id: project.id,
            title: project.title,
            created_at: project.created_at,
            state: project.state,
            property,
            owner
          });
        } catch (error) {
          console.error("Error processing project:", error);
          // Still add project with default values
          processedProjects.push({
            id: project.id,
            title: project.title,
            created_at: project.created_at,
            state: project.state,
            property: {
              property_name: "Unknown Property",
              address_line1: "Address not available",
              city: "Unknown",
              state: "Unknown"
            },
            owner: {
              id: project.user_id,
              name: "Unknown User",
              email: "email@unknown.com"
            }
          });
        }
      }
      
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
