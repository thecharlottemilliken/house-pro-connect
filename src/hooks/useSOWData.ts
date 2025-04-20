
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SOWData {
  id?: string;
  project_id: string;
  work_areas: any[];
  labor_items: any[];
  material_items: any[];
  bid_configuration: {
    bidDuration: string;
    projectDescription: string;
  };
  status: string;
  created_at?: string;
  updated_at?: string;
}

function parseJsonField(field: any, defaultValue: any) {
  if (!field) {
    return defaultValue;
  }
  try {
    // Sometimes Supabase returns JSON type as string, or as object directly
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (e) {
    console.warn('Failed to parse JSON field:', e);
    return defaultValue;
  }
}

export const useSOWData = (projectId: string | undefined) => {
  const [sowData, setSOWData] = useState<SOWData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSOWData = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if SOW exists for this project
        const { data, error: fetchError } = await supabase
          .from('statement_of_work')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        if (data) {
          setSOWData({
            ...data,
            work_areas: parseJsonField(data.work_areas, []),
            labor_items: parseJsonField(data.labor_items, []),
            material_items: parseJsonField(data.material_items, []),
            bid_configuration: parseJsonField(data.bid_configuration, { bidDuration: '7', projectDescription: '' }),
          });
        } else {
          // Create an empty SOW record if none exists
          setSOWData({
            project_id: projectId,
            work_areas: [],
            labor_items: [],
            material_items: [],
            bid_configuration: {
              bidDuration: '7',
              projectDescription: ''
            },
            status: 'draft'
          });
        }
      } catch (err: any) {
        console.error("Error fetching SOW data:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSOWData();
  }, [projectId]);

  // Function to save SOW field data
  const saveSOWField = async (field: string, value: any): Promise<boolean> => {
    if (!projectId || !sowData) return false;
    
    try {
      console.log(`Saving ${field} with value:`, value);
      
      // Check if SOW exists
      if (sowData.id) {
        // Update existing SOW record
        const { error } = await supabase
          .from('statement_of_work')
          .update({ [field]: value })
          .eq('id', sowData.id);
        
        if (error) throw error;
      } else {
        // Create new SOW record
        const { data, error } = await supabase
          .from('statement_of_work')
          .insert([{ 
            project_id: projectId,
            [field]: value 
          }])
          .select('*')
          .single();
        
        if (error) throw error;
        
        if (data) {
          setSOWData({
            ...data,
            work_areas: parseJsonField(data.work_areas, []),
            labor_items: parseJsonField(data.labor_items, []),
            material_items: parseJsonField(data.material_items, []),
            bid_configuration: parseJsonField(data.bid_configuration, { bidDuration: '7', projectDescription: '' }),
          });
        }
      }
      
      // Update local state
      setSOWData(prev => prev ? { ...prev, [field]: value } : null);
      return true;
    } catch (error) {
      console.error(`Failed to save SOW field ${field}:`, error);
      toast({
        title: "Error",
        description: `Unable to save changes to the database.`,
        variant: "destructive"
      });
      return false;
    }
  };

  return { 
    sowData, 
    isLoading, 
    error,
    saveSOWField
  };
};
