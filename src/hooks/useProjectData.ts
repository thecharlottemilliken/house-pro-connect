
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PropertyDetails {
  id: string;
  property_name: string;
  image_url: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
}

interface RenovationArea {
  area: string;
  location: string;
}

interface Project {
  id: string;
  property_id: string;
  title: string;
  renovation_areas: RenovationArea[];
  created_at: string;
}

export const useProjectData = (projectId?: string, initialData?: any) => {
  const navigate = useNavigate();
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
    } 
    else if (initialData?.propertyId && initialData?.completed) {
      setProjectData(initialData);
      fetchPropertyDetails(initialData.propertyId);
    } 
    else {
      navigate("/dashboard");
    }
  }, [projectId, initialData, navigate]);

  const fetchProjectById = async (id: string) => {
    setIsLoading(true);
    try {
      // Using from method without any type constraints to avoid TypeScript errors
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      setProjectData(data);
      fetchPropertyDetails(data.property_id);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
        variant: "destructive"
      });
      navigate("/projects");
    }
  };

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      // Using from method without any type constraints to avoid TypeScript errors
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setPropertyDetails(data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast({
        title: "Error",
        description: "Failed to load property details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { projectData, propertyDetails, isLoading };
};
