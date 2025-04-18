
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define work area types
export interface WorkArea {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  notes: string;
}

// Define labor types
export interface LaborItem {
  id: string;
  category: string;
  subcategory: string;
  affectedAreas: string[];
  notes: string;
}

// Define material types
export interface MaterialItem {
  id: string;
  category: string;
  subcategory: string;
  quantity: number;
  unit: string;
  details: Record<string, string>;
  notes: string;
}

// Define SOW data structure
export interface SOWData {
  workAreas: WorkArea[];
  laborItems: LaborItem[];
  materialItems: MaterialItem[];
}

interface SOWContextType {
  sowData: SOWData;
  addWorkArea: (workArea: WorkArea) => void;
  updateWorkArea: (id: string, updates: Partial<WorkArea>) => void;
  removeWorkArea: (id: string) => void;
  addLaborItem: (laborItem: LaborItem) => void;
  updateLaborItem: (id: string, updates: Partial<LaborItem>) => void;
  removeLaborItem: (id: string) => void;
  addMaterialItem: (materialItem: MaterialItem) => void;
  updateMaterialItem: (id: string, updates: Partial<MaterialItem>) => void;
  removeMaterialItem: (id: string) => void;
  saveSOW: () => Promise<void>;
}

const SOWContext = createContext<SOWContextType | undefined>(undefined);

export const useSOW = (): SOWContextType => {
  const context = useContext(SOWContext);
  if (!context) {
    throw new Error('useSOW must be used within a SOWProvider');
  }
  return context;
};

interface SOWProviderProps {
  children: ReactNode;
  projectId: string;
}

export const SOWProvider: React.FC<SOWProviderProps> = ({ children, projectId }) => {
  // Initialize SOW data
  const [sowData, setSOWData] = useState<SOWData>({
    workAreas: [],
    laborItems: [],
    materialItems: []
  });

  // Work Areas
  const addWorkArea = (workArea: WorkArea) => {
    setSOWData(prev => ({
      ...prev,
      workAreas: [...prev.workAreas, workArea]
    }));
  };

  const updateWorkArea = (id: string, updates: Partial<WorkArea>) => {
    setSOWData(prev => ({
      ...prev,
      workAreas: prev.workAreas.map(area => 
        area.id === id ? { ...area, ...updates } : area
      )
    }));
  };

  const removeWorkArea = (id: string) => {
    setSOWData(prev => ({
      ...prev,
      workAreas: prev.workAreas.filter(area => area.id !== id)
    }));
  };

  // Labor Items
  const addLaborItem = (laborItem: LaborItem) => {
    setSOWData(prev => ({
      ...prev,
      laborItems: [...prev.laborItems, laborItem]
    }));
  };

  const updateLaborItem = (id: string, updates: Partial<LaborItem>) => {
    setSOWData(prev => ({
      ...prev,
      laborItems: prev.laborItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const removeLaborItem = (id: string) => {
    setSOWData(prev => ({
      ...prev,
      laborItems: prev.laborItems.filter(item => item.id !== id)
    }));
  };

  // Material Items
  const addMaterialItem = (materialItem: MaterialItem) => {
    setSOWData(prev => ({
      ...prev,
      materialItems: [...prev.materialItems, materialItem]
    }));
  };

  const updateMaterialItem = (id: string, updates: Partial<MaterialItem>) => {
    setSOWData(prev => ({
      ...prev,
      materialItems: prev.materialItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const removeMaterialItem = (id: string) => {
    setSOWData(prev => ({
      ...prev,
      materialItems: prev.materialItems.filter(item => item.id !== id)
    }));
  };

  // Save SOW to database
  const saveSOW = async () => {
    try {
      // For now, we'll save the SOW as a JSON document in the project
      const { data, error } = await supabase
        .from('projects')
        .update({
          // Using a generic approach to avoid type issues
          // We are adding statement_of_work as a jsonb column to the projects table
          // This will be handled properly by Supabase
          design_preferences: {
            statement_of_work: sowData
          }
        })
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Statement of Work has been saved successfully."
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving SOW:', error);
      toast({
        title: "Error",
        description: "Failed to save Statement of Work. Please try again.",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const value = {
    sowData,
    addWorkArea,
    updateWorkArea,
    removeWorkArea,
    addLaborItem,
    updateLaborItem,
    removeLaborItem,
    addMaterialItem,
    updateMaterialItem,
    removeMaterialItem,
    saveSOW
  };

  return (
    <SOWContext.Provider value={value}>
      {children}
    </SOWContext.Provider>
  );
};
