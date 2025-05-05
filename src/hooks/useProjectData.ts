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

export const useProjectData = (projectId?: string, initialData?: any) => {
  const [projectData, setProjectData] = useState<any>(initialData || null);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData && !!projectId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    }
  }, [projectId]);

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
          setProjectData(edgeData);
          
          if (edgeData.property_id) {
            fetchPropertyDetails(edgeData.property_id);
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
      
      setProjectData(data);
      
      if (data.property_id) {
        fetchPropertyDetails(data.property_id);
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
