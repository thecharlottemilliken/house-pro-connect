
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
  state?: string;
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

        // Use RPC to bypass RLS issues
        const { data: project, error: projectError } = await supabase.rpc('handle_project_update', {
          p_project_id: projectId,
          p_property_id: null, // Just retrieving, not updating
          p_user_id: null,
          p_title: '',
          p_renovation_areas: null,
          p_project_preferences: null,
          p_construction_preferences: null,
          p_design_preferences: null,
          p_management_preferences: null,
          p_prior_experience: null
        });

        if (projectError) {
          // Fallback to direct query if RPC fails
          const { data: directProject, error: directProjectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
            
          if (directProjectError) {
            throw directProjectError;
          }
          
          if (!directProject) {
            throw new Error("Project not found");
          }
          
          const projectDataMapped: ProjectData = {
            id: directProject.id,
            created_at: directProject.created_at,
            title: directProject.title,
            description: (directProject as any).description || null,
            status: directProject.state || 'active',
            property_id: directProject.property_id,
            user_id: directProject.user_id,
            design_preferences: directProject.design_preferences as unknown as DesignPreferences || {
              hasDesigns: false,
              designers: [],
              designAssets: [],
              renderingImages: [],
              inspirationImages: [],
              pinterestBoards: [],
              beforePhotos: {},
              roomMeasurements: {}
            },
            renovation_areas: (directProject.renovation_areas as unknown as RenovationArea[]) || [],
            construction_preferences: directProject.construction_preferences || {},
            management_preferences: directProject.management_preferences || {},
            project_preferences: directProject.project_preferences || {},
            prior_experience: directProject.prior_experience || {},
            state: directProject.state || 'active'
          };

          setProjectData(projectDataMapped);

          // Fetch property using direct query
          const { data: property, error: propertyError } = await supabase
            .from('properties')
            .select('*')
            .eq('id', directProject.property_id)
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
        } else {
          // If RPC was successful, fetch project details normally
          const { data: projectDetails, error: projectDetailsError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

          if (projectDetailsError) {
            throw projectDetailsError;
          }

          if (!projectDetails) {
            throw new Error("Project not found");
          }

          const projectDataMapped: ProjectData = {
            id: projectDetails.id,
            created_at: projectDetails.created_at,
            title: projectDetails.title,
            description: (projectDetails as any).description || null,
            status: projectDetails.state || 'active',
            property_id: projectDetails.property_id,
            user_id: projectDetails.user_id,
            design_preferences: projectDetails.design_preferences as unknown as DesignPreferences || {
              hasDesigns: false,
              designers: [],
              designAssets: [],
              renderingImages: [],
              inspirationImages: [],
              pinterestBoards: [],
              beforePhotos: {},
              roomMeasurements: {}
            },
            renovation_areas: (projectDetails.renovation_areas as unknown as RenovationArea[]) || [],
            construction_preferences: projectDetails.construction_preferences || {},
            management_preferences: projectDetails.management_preferences || {},
            project_preferences: projectDetails.project_preferences || {},
            prior_experience: projectDetails.prior_experience || {},
            state: projectDetails.state || 'active'
          };

          setProjectData(projectDataMapped);

          const { data: property, error: propertyError } = await supabase
            .from('properties')
            .select('*')
            .eq('id', projectDetails.property_id)
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
        }
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
