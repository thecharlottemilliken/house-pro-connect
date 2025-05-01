import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { type PinterestBoard } from "@/types/pinterest";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  interior_attributes?: any;
  exterior_attributes?: any;
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
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // If we have locationState with propertyId but no projectId, we're in the create project flow
        // Just fetch property details directly
        if (!projectId && locationState?.propertyId) {
          console.log(`No project ID provided, but propertyId found: ${locationState.propertyId}`);
          
          if (!user) {
            throw new Error("User is not authenticated");
          }
          
          // Fetch property details directly
          const { data: propertyData, error: propertyError } = await supabase.functions.invoke(
            'get-property-details',
            { 
              body: { 
                propertyId: locationState.propertyId,
                userId: user.id 
              }
            }
          );
          
          if (propertyError) {
            throw propertyError;
          }
          
          if (!propertyData) {
            throw new Error("Property not found");
          }
          
          const propertyDetailsMapped: PropertyDetails = {
            id: propertyData.id,
            property_name: propertyData.property_name,
            address: `${propertyData.address_line1}, ${propertyData.city}, ${propertyData.state} ${propertyData.zip_code}`,
            address_line1: propertyData.address_line1,
            city: propertyData.city,
            state: propertyData.state,
            zip: propertyData.zip_code,
            zip_code: propertyData.zip_code,
            home_photos: propertyData.home_photos || [],
            image_url: propertyData.image_url || '',
            blueprint_url: propertyData.blueprint_url,
            interior_attributes: propertyData.interior_attributes,
            exterior_attributes: propertyData.exterior_attributes
          };

          setPropertyDetails(propertyDetailsMapped);
          setIsLoading(false);
          return;
        }
        
        // Skip fetching if no projectId and no propertyId in locationState
        if (!projectId && !locationState?.propertyId) {
          console.log("No project ID or property ID provided, skipping data fetch");
          setIsLoading(false);
          return;
        }

        if (!projectId || !user) {
          throw new Error("Project ID is undefined or user is not authenticated");
        }

        console.log(`Fetching project data for project: ${projectId} and user: ${user.id}`);

        let projectDetails;
        let propertyData;
        const isCoach = profile?.role === 'coach';

        // Coach access path - use direct database query with RLS bypassing functions
        if (isCoach) {
          console.log("Using coach access path for project data");
          
          try {
            // Use direct database queries for coaches (RLS policies now allow this)
            const { data: coachProjectData, error: coachProjectError } = await supabase
              .from('projects')
              .select('*')
              .eq('id', projectId)
              .maybeSingle();
              
            if (coachProjectError) {
              console.error("Error fetching project using coach path:", coachProjectError);
              throw coachProjectError;
            }
            
            if (!coachProjectData) {
              throw new Error("Project not found");
            }
            
            projectDetails = coachProjectData;
            
            // Now get property data
            const { data: coachPropertyData, error: coachPropertyError } = await supabase
              .from('properties')
              .select('*')
              .eq('id', projectDetails.property_id)
              .maybeSingle();
              
            if (coachPropertyError) {
              console.error("Error fetching property using coach path:", coachPropertyError);
              throw coachPropertyError;
            }
            
            if (!coachPropertyData) {
              throw new Error("Property not found");
            }
            
            propertyData = coachPropertyData;
          } catch (coachError) {
            console.error("Coach access path failed, falling back to edge functions:", coachError);
            
            // Fall back to edge functions if direct access fails
            const { data: projectEdgeData, error: projectError } = await supabase.functions.invoke(
              'handle-project-update',
              {
                body: { 
                  projectId, 
                  userId: user.id 
                }
              }
            );
            
            if (projectError) throw projectError;
            projectDetails = projectEdgeData;

            const { data: propertyEdgeData, error: propertyError } = await supabase.functions.invoke(
              'get-property-details',
              { 
                body: { 
                  propertyId: projectDetails.property_id,
                  userId: user.id 
                }
              }
            );
            
            if (propertyError) throw propertyError;
            propertyData = propertyEdgeData;
          }
        } else {
          // Non-coach path - use edge functions as before
          const { data: projectEdgeData, error: projectError } = await supabase.functions.invoke(
            'handle-project-update',
            {
              body: { 
                projectId, 
                userId: user.id 
              }
            }
          );
          
          if (projectError) {
            console.error("Error fetching project data via edge function:", projectError);
            throw new Error("Failed to fetch project data");
          }
          projectDetails = projectEdgeData;

          if (!projectDetails) {
            console.error("Project details not found");
            throw new Error("Project details not found");
          }

          const { data: propertyEdgeData, error: propertyError } = await supabase.functions.invoke(
            'get-property-details',
            { 
              body: { 
                propertyId: projectDetails.property_id,
                userId: user.id 
              }
            }
          );
          
          if (propertyError) {
            console.error("Error fetching property via edge function:", propertyError);
            throw propertyError;
          }
          
          if (!propertyEdgeData) {
            console.error("Property not found via edge function");
            throw new Error("Property not found");
          }
          
          propertyData = propertyEdgeData;
        }

        console.log("Project data retrieved successfully:", projectDetails);

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

        const propertyDetailsMapped: PropertyDetails = {
          id: propertyData.id,
          property_name: propertyData.property_name,
          address: `${propertyData.address_line1}, ${propertyData.city}, ${propertyData.state} ${propertyData.zip_code}`,
          address_line1: propertyData.address_line1,
          city: propertyData.city,
          state: propertyData.state,
          zip: propertyData.zip_code,
          zip_code: propertyData.zip_code,
          home_photos: propertyData.home_photos || [],
          image_url: propertyData.image_url || '',
          blueprint_url: propertyData.blueprint_url,
          interior_attributes: propertyData.interior_attributes,
          exterior_attributes: propertyData.exterior_attributes
        };

        setPropertyDetails(propertyDetailsMapped);
      } catch (err: any) {
        setError(err);
        console.error("Error fetching project data:", err);
        
        // Only show toast for actual project fetch errors, not when we're just missing IDs
        if (projectId) {
          toast.error(`Error loading project: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, user, profile, locationState]);

  return { projectData, propertyDetails, isLoading, error };
};
