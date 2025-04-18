import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Enums, Json } from "@/integrations/supabase/types";

interface PropertyDetails {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  home_photos: string[];
}

export interface ProjectData {
  id: string;
  created_at: string;
  title: string;
  description: string;
  status: Enums<'project_status'>;
  property_id: string;
  user_id: string;
  design_preferences: Json;
  renovation_areas: Json;
}

export interface DesignPreferences {
  hasDesigns: boolean;
  designers?: Array<{ id: string; businessName: string; }>;
  designAssets?: Array<{ name: string; url: string; }>;
  renderingImages?: string[];
  inspirationImages?: string[];
  beforePhotos?: Record<string, string[]>;
  roomMeasurements?: Record<string, {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  }>;
}

interface UseProjectDataResult {
  projectData: ProjectData | null;
  propertyDetails: PropertyDetails | null;
  isLoading: boolean;
  error: Error | null;
}

export const useProjectData = (projectId: string | undefined, locationState: any): UseProjectDataResult => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!projectId) {
          throw new Error("Project ID is undefined");
        }

        // Fetch project data
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) {
          throw projectError;
        }

        if (!project) {
          throw new Error("Project not found");
        }

        setProjectData(project as ProjectData);

        // Fetch property details
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', project.property_id)
          .single();

        if (propertyError) {
          throw propertyError;
        }

        if (!property) {
          throw new Error("Property not found");
        }

        setPropertyDetails(property as PropertyDetails);
      } catch (err: any) {
        setError(err);
        console.error("Error fetching project data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  return { projectData, propertyDetails, isLoading, error };
};
