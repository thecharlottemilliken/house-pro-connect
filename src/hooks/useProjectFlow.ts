
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Type for the project flow data
export interface ProjectFlowData {
  propertyId: string | null;
  projectId: string | null;
  title: string;
  renovationAreas?: any[];
  projectPreferences?: any;
  constructionPreferences?: any;
  designPreferences?: any;
  managementPreferences?: any;
  prior_experience?: any;
  [key: string]: any; // Allow any additional properties
}

// Hook to manage project flow state
export const useProjectFlow = (initialData?: any) => {
  const [flowData, setFlowData] = useState<ProjectFlowData>({
    propertyId: null,
    projectId: null,
    title: 'New Project',
    renovationAreas: [],
    projectPreferences: {},
    constructionPreferences: {},
    designPreferences: {},
    managementPreferences: {},
    prior_experience: {}
  });
  
  const navigate = useNavigate();
  
  // Initialize with passed data
  useEffect(() => {
    if (initialData) {
      setFlowData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);
  
  // Update specific section data
  const updateFlowData = (key: string, data: any) => {
    setFlowData(prev => ({
      ...prev,
      [key]: data
    }));
  };
  
  // Navigate to next step with current data
  const navigateWithData = (path: string) => {
    navigate(path, { state: flowData });
  };
  
  return {
    flowData,
    updateFlowData,
    setFlowData,
    navigateWithData
  };
};
