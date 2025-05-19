
import { SOWData } from '@/hooks/useSOWData';

// Define the structure for tracked changes
export interface ChangeTracker {
  workAreas: {
    [key: string]: boolean; // Key is work area id, value is whether it changed
  };
  laborItems: {
    [key: string]: boolean; // Key is labor item id, value is whether it changed
  };
  materialItems: {
    [key: string]: boolean; // Key is material item id, value is whether it changed
  };
  bidConfiguration: boolean;
  isRevision: boolean;
}

// Initialize a change tracker
export const initializeChangeTracker = (): ChangeTracker => ({
  workAreas: {},
  laborItems: {},
  materialItems: {},
  bidConfiguration: false,
  isRevision: false,
});

// Deep compare two objects to detect changes
export const objectsAreDifferent = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return true;
  if (obj1 === null || obj2 === null) return true;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return true;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return true;
    if (typeof obj1[key] === 'object' && obj1[key] !== null) {
      if (objectsAreDifferent(obj1[key], obj2[key])) return true;
    } else if (obj1[key] !== obj2[key]) {
      return true;
    }
  }
  
  return false;
};

// Parse JSON fields for proper comparison
export const parseJsonField = (field: any, defaultValue: any) => {
  if (!field) {
    return defaultValue;
  }
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (e) {
    console.warn('Failed to parse JSON field:', e);
    return defaultValue;
  }
};

// Track changes between previous and current SOW data
export const trackChanges = (previousData: SOWData | null, currentData: SOWData | null): ChangeTracker => {
  const changes = initializeChangeTracker();
  
  if (!previousData || !currentData) {
    return changes;
  }
  
  // Check if this is a revision based on previous status
  changes.isRevision = (previousData.status === 'pending revision');
  
  // Compare work areas
  const currentWorkAreas = Array.isArray(currentData.work_areas) ? currentData.work_areas : [];
  const previousWorkAreas = Array.isArray(previousData.work_areas) ? previousData.work_areas : [];
  
  currentWorkAreas.forEach((workArea: any, index: number) => {
    const id = workArea.id || `index-${index}`;
    const previousWorkArea = previousWorkAreas.find((area: any) => 
      (area.id && area.id === id) || (!area.id && index === previousWorkAreas.indexOf(area))
    );
    
    changes.workAreas[id] = !previousWorkArea || objectsAreDifferent(previousWorkArea, workArea);
  });
  
  // Compare labor items
  const currentLaborItems = Array.isArray(currentData.labor_items) ? currentData.labor_items : [];
  const previousLaborItems = Array.isArray(previousData.labor_items) ? previousData.labor_items : [];
  
  currentLaborItems.forEach((laborItem: any, index: number) => {
    const id = laborItem.id || `index-${index}`;
    const previousLaborItem = previousLaborItems.find((item: any) => 
      (item.id && item.id === id) || (!item.id && index === previousLaborItems.indexOf(item))
    );
    
    changes.laborItems[id] = !previousLaborItem || objectsAreDifferent(previousLaborItem, laborItem);
  });
  
  // Compare material items
  const currentMaterialItems = Array.isArray(currentData.material_items) ? currentData.material_items : [];
  const previousMaterialItems = Array.isArray(previousData.material_items) ? previousData.material_items : [];
  
  currentMaterialItems.forEach((materialItem: any, index: number) => {
    const id = materialItem.id || `index-${index}`;
    const previousMaterialItem = previousMaterialItems.find((item: any) => 
      (item.id && item.id === id) || (!item.id && index === previousMaterialItems.indexOf(item))
    );
    
    changes.materialItems[id] = !previousMaterialItem || objectsAreDifferent(previousMaterialItem, materialItem);
  });
  
  // Compare bid configuration
  changes.bidConfiguration = objectsAreDifferent(
    previousData.bid_configuration || {},
    currentData.bid_configuration || {}
  );
  
  return changes;
};
