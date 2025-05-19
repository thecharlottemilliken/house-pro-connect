
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
  management_preferences?: any;
  hasCoachingSession?: boolean; // Added new property
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
      console.log("Fetching projects as coach using edge function...");
      
      // Use the edge function to bypass RLS
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
        'get-coach-projects',
        { method: 'GET' }
      );
      
      if (edgeError) {
        console.error("Error calling get-coach-projects edge function:", edgeError);
        throw edgeError;
      }
      
      if (edgeData && Array.isArray(edgeData.projects)) {
        console.log(`Found ${edgeData.projects.length} projects via edge function`);
        setProjects(edgeData.projects);
      } else {
        console.log("No projects found or invalid response format");
        setProjects([]);
      }
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
