
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { type PinterestBoard } from "@/types/pinterest";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!projectId || !user) {
          throw new Error("Project ID is undefined or user is not authenticated");
        }

        // Use the edge function to get project data to avoid RLS issues
        const { data: projectDetails, error: projectError } = await supabase.functions.invoke(
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

        if (!projectDetails) {
          throw new Error("Project details not found");
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

        // Use the security definer function to fetch property details
        const { data: propertyData, error: propertyFnError } = await supabase
          .rpc('get_property_details', { p_property_id: projectDetails.property_id });

        if (propertyFnError) {
          console.warn("Property function call failed:", propertyFnError);
          
          // Fallback to edge function to get property data
          try {
            const { data: propertyViaEdge, error: edgePropertyError } = await supabase.functions.invoke(
              'get-property-details', 
              { 
                body: { 
                  propertyId: projectDetails.property_id,
                  userId: user.id 
                } 
              }
            );
            
            if (edgePropertyError) {
              throw edgePropertyError;
            }
            
            if (propertyViaEdge) {
              const property = propertyViaEdge;
              
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
              return;
            }
          } catch (edgeError) {
            console.error("Edge function property fetch error:", edgeError);
          }
          
          // As a last resort, try direct query
          try {
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
          } catch (innerError) {
            console.error("Inner property fetch error:", innerError);
            // Create minimal property details if all else fails
            if (projectDetails && projectDetails.property_id) {
              setPropertyDetails({
                id: projectDetails.property_id,
                property_name: "Property Details Unavailable",
                address: "Address unavailable",
                address_line1: "",
                city: "",
                state: "",
                zip: "",
                zip_code: "",
                home_photos: [],
                image_url: "",
              });
            }
          }
        } else if (propertyData && propertyData.length > 0) {
          const property = propertyData[0];
          
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
  }, [projectId, user]);

  return { projectData, propertyDetails, isLoading, error };
};
