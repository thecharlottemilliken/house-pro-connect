
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
  home_photos?: string[]; // Added home_photos property
}

interface RenovationArea {
  area: string;
  location: string;
}

interface Designer {
  id: string;
  businessName: string;
  email?: string;
}

export interface DesignPreferences {
  hasDesigns?: boolean;
  designers?: Designer[];
  designAssets?: Array<{name: string, url: string}>;
  renderingImages?: string[];
  inspirationImages?: string[];
  beforePhotos?: Record<string, string[]>; // Added beforePhotos property as a record of area keys to photo arrays
}

interface Project {
  id: string;
  property_id: string;
  title: string;
  renovation_areas: RenovationArea[];
  created_at: string;
  design_preferences: DesignPreferences;
}

export const useProjectData = (projectId?: string, initialData?: any) => {
  const navigate = useNavigate();
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [projectData, setProjectData] = useState<Project | null>(null);
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
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }

      // Parse renovation_areas from JSON
      const renovationAreas = Array.isArray(data.renovation_areas) 
        ? data.renovation_areas 
        : (typeof data.renovation_areas === 'string' 
            ? JSON.parse(data.renovation_areas) 
            : []);
      
      // Parse design_preferences with proper type casting
      let designPreferencesData: DesignPreferences = {};
      
      if (data.design_preferences) {
        // Handle different possible types of design_preferences
        if (typeof data.design_preferences === 'string') {
          try {
            designPreferencesData = JSON.parse(data.design_preferences) as DesignPreferences;
          } catch (e) {
            console.error('Error parsing design_preferences string:', e);
          }
        } else {
          // Assume it's already an object
          designPreferencesData = data.design_preferences as DesignPreferences;
        }
      }

      // Initialize beforePhotos if it doesn't exist
      if (!designPreferencesData.beforePhotos) {
        designPreferencesData.beforePhotos = {};
      }
      
      // Create a properly typed Project object
      const typedProject: Project = {
        id: data.id,
        property_id: data.property_id,
        title: data.title,
        renovation_areas: renovationAreas,
        created_at: data.created_at,
        design_preferences: designPreferencesData
      };
      
      setProjectData(typedProject);
      
      if (data && data.property_id) {
        fetchPropertyDetails(data.property_id);
      } else {
        setIsLoading(false);
      }
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
