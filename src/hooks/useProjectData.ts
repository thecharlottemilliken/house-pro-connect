import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { type PinterestBoard } from "@/types/pinterest";

export interface PropertyDetails {
  id: string;
  property_name: string;
  address: string;
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  zip_code: string;
  home_photos: string[];
  image_url: string;
  blueprint_url?: string | null;
}

export interface ProjectData {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  status: string;
  property_id: string;
  user_id: string;
  design_preferences: DesignPreferences | null;
  renovation_areas: RenovationArea[];
  construction_preferences: Json;
  management_preferences: Json;
  project_preferences: Json;
  prior_experience: Json;
}

export interface DesignPreferences {
  hasDesigns: boolean;
  designers?: Array<{ id: string; businessName: string; }>;
  designAssets?: Array<{ name: string; url: string; }>;
  renderingImages?: string[];
  inspirationImages?: string[];
  pinterestBoards?: PinterestBoard[];
  beforePhotos?: Record<string, string[]>;
  roomMeasurements?: Record<string, {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  }>;
}

export interface PinterestBoard {
  id: string;
  name: string;
  url: string;
  imageUrl?: string;
}

export interface RenovationArea {
  area: string;
  location?: string;
}

interface UseProjectDataResult {
  projectData: ProjectData | null;
  propertyDetails: PropertyDetails | null;
  isLoading: boolean;
  error: Error | null;
}

export const useProjectData = (projectId: string | undefined, locationState: any = null): UseProjectDataResult => {
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

        const projectDataMapped: ProjectData = {
          id: project.id,
          created_at: project.created_at,
          title: project.title,
          description: (project as any).description || null,
          status: project.state || 'active',
          property_id: project.property_id,
          user_id: project.user_id,
          design_preferences: project.design_preferences as DesignPreferences || {
            hasDesigns: false,
            designers: [],
            designAssets: [],
            renderingImages: [],
            inspirationImages: [],
            pinterestBoards: [],
            beforePhotos: {},
            roomMeasurements: {}
          },
          renovation_areas: (project.renovation_areas as unknown as RenovationArea[]) || [],
          construction_preferences: project.construction_preferences || {},
          management_preferences: project.management_preferences || {},
          project_preferences: project.project_preferences || {},
          prior_experience: project.prior_experience || {}
        };

        setProjectData(projectDataMapped);

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

        const propertyDetailsMapped: PropertyDetails = {
          id: property.id,
          property_name: property.property_name,
          address: `${property.address_line1}, ${property.city}, ${property.state} ${property.zip_code}`,
          address_line1: property.address_line1,
          city: property.city,
          state: property.state,
          zip: property.zip_code,
          zip_code: property.zip_code,
          home_photos: property.home_photos || [],
          image_url: property.image_url || '',
          blueprint_url: property.blueprint_url
        };

        setPropertyDetails(propertyDetailsMapped);
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

export { useProjectData };
