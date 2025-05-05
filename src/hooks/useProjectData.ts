
import { Json } from "@/integrations/supabase/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DesignPreferences {
  hasDesigns: boolean;
  designers?: any[];
  designerContactInfo?: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    assignedArea: string;
  }[];
  designAssets?: { name: string; url: string }[];
  renderingImages?: string[];
  inspirationImages?: string[];
  pinterestBoards?: Record<string, any>;
  beforePhotos?: Record<string, string[]>;
  roomMeasurements?: Record<string, {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  }>;
}

export interface RenovationArea {
  area: string;
  location?: string;
}

export interface ProjectData {
  id: string;
  title?: string;
  property_id?: string;
  renovation_areas?: RenovationArea[];
  design_preferences?: DesignPreferences;
  project_preferences?: Record<string, any>;
  management_preferences?: Record<string, any>;
  [key: string]: any; // Allow for other properties
}

export const useProjectData = (projectId?: string, initialData?: any) => {
  const [projectData, setProjectData] = useState<ProjectData | null>(initialData || null);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData && !!projectId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    }
  }, [projectId]);

  // Helper function to convert JSON renovation areas to typed RenovationArea[]
  const processRenovationAreas = (areas: Json | null): RenovationArea[] => {
    if (!areas || !Array.isArray(areas)) return [];
    
    return areas.map(area => {
      if (typeof area === 'object' && area !== null && 'area' in area) {
        return {
          area: String(area.area),
          location: 'location' in area ? String(area.location) : undefined
        };
      }
      // If the item doesn't have the expected structure, return a default
      return { area: 'Unknown' };
    });
  };

  // Helper function to process design preferences
  const processDesignPreferences = (prefs: Json | null): DesignPreferences | undefined => {
    if (!prefs || typeof prefs !== 'object') return undefined;
    
    // Cast to necessary type with safety checks
    return prefs as unknown as DesignPreferences;
  };

  // Helper function to process JSON to Record<string, any>
  const processJsonToRecord = (data: Json | null): Record<string, any> | undefined => {
    if (!data || typeof data !== 'object') return undefined;
    
    // Cast JSON to Record<string, any> with safety check
    return data as unknown as Record<string, any>;
  };

  const fetchProjectData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to get data from the edge function
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('handle-project-update', {
          method: 'POST',
          body: { 
            projectId: id,
            action: 'get'
          }
        });

        if (!edgeError && edgeData) {
          // Process the data to ensure it matches our ProjectData interface
          const processedData: ProjectData = {
            ...edgeData,
            // Convert renovation_areas from Json to RenovationArea[]
            renovation_areas: processRenovationAreas(edgeData.renovation_areas),
            // Convert design_preferences from Json to DesignPreferences
            design_preferences: processDesignPreferences(edgeData.design_preferences),
            // Convert other preference fields to Record<string, any>
            project_preferences: processJsonToRecord(edgeData.project_preferences),
            management_preferences: processJsonToRecord(edgeData.management_preferences)
          };
          
          setProjectData(processedData);
          
          if (processedData.property_id) {
            fetchPropertyDetails(processedData.property_id);
          }
          
          return;
        }
      } catch (edgeErr) {
        console.error("Edge function error:", edgeErr);
      }

      // Fallback to direct query
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Process the data to ensure it matches our ProjectData interface
      const processedData: ProjectData = {
        ...data,
        // Convert renovation_areas from Json to RenovationArea[]
        renovation_areas: processRenovationAreas(data.renovation_areas),
        // Convert design_preferences from Json to DesignPreferences
        design_preferences: processDesignPreferences(data.design_preferences),
        // Convert other preference fields to Record<string, any>
        project_preferences: processJsonToRecord(data.project_preferences),
        management_preferences: processJsonToRecord(data.management_preferences)
      };
      
      setProjectData(processedData);
      
      if (processedData.property_id) {
        fetchPropertyDetails(processedData.property_id);
      }
    } catch (err: any) {
      console.error("Error fetching project data:", err);
      setError(err.message || "Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      
      setPropertyDetails(data);
    } catch (err) {
      console.error("Error fetching property details:", err);
    }
  };

  return {
    projectData,
    propertyDetails,
    isLoading,
    error,
    refetch: projectId ? () => fetchProjectData(projectId) : null
  };
};
