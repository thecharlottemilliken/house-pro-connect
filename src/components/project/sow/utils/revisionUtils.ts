
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

// Track changes between previous and current SOW data
export const trackChanges = (previousData: SOWData | null, currentData: SOWData | null): ChangeTracker => {
  const changes = initializeChangeTracker();
  
  if (!previousData || !currentData) {
    return changes;
  }
  
  // Check if this is a revision based on previous status
  changes.isRevision = (previousData.status === 'pending revision');
  
  // Compare work areas
  (currentData.work_areas || []).forEach((workArea: any, index: number) => {
    const id = workArea.id || `index-${index}`;
    const previousWorkArea = (previousData.work_areas || []).find((area: any) => 
      (area.id && area.id === id) || (!area.id && index === (previousData.work_areas || []).indexOf(area))
    );
    
    changes.workAreas[id] = !previousWorkArea || objectsAreDifferent(previousWorkArea, workArea);
  });
  
  // Compare labor items
  (currentData.labor_items || []).forEach((laborItem: any, index: number) => {
    const id = laborItem.id || `index-${index}`;
    const previousLaborItem = (previousData.labor_items || []).find((item: any) => 
      (item.id && item.id === id) || (!item.id && index === (previousData.labor_items || []).indexOf(item))
    );
    
    changes.laborItems[id] = !previousLaborItem || objectsAreDifferent(previousLaborItem, laborItem);
  });
  
  // Compare material items
  (currentData.material_items || []).forEach((materialItem: any, index: number) => {
    const id = materialItem.id || `index-${index}`;
    const previousMaterialItem = (previousData.material_items || []).find((item: any) => 
      (item.id && item.id === id) || (!item.id && index === (previousData.material_items || []).indexOf(item))
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
