
import { SOWData } from '@/hooks/useSOWData';

// Define the structure for tracked changes - more detailed with status field
export interface ChangeTracker {
  workAreas: {
    [key: string]: { status: 'added' | 'modified' | 'unchanged', details?: any };
  };
  laborItems: {
    [key: string]: { status: 'added' | 'modified' | 'unchanged', details?: any };
  };
  materialItems: {
    [key: string]: { status: 'added' | 'modified' | 'unchanged', details?: any };
  };
  bidConfiguration: { 
    status: 'modified' | 'unchanged';
    fields?: {
      [key: string]: { status: 'added' | 'modified' | 'unchanged', oldValue?: any, newValue?: any }
    }
  };
  isRevision: boolean;
}

// Initialize a change tracker
export const initializeChangeTracker = (): ChangeTracker => ({
  workAreas: {},
  laborItems: {},
  materialItems: {},
  bidConfiguration: { status: 'unchanged' },
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

// Find specific differences between objects
export const findDifferences = (obj1: any, obj2: any): { [key: string]: { status: 'added' | 'modified', oldValue?: any, newValue: any } } => {
  const differences: { [key: string]: { status: 'added' | 'modified', oldValue?: any, newValue: any } } = {};
  
  // Check for changed or added fields in obj2
  Object.keys(obj2).forEach(key => {
    // If key doesn't exist in obj1, it's a new addition
    if (!(key in obj1)) {
      differences[key] = { status: 'added', newValue: obj2[key] };
    }
    // If values are different, it's a modification
    else if (typeof obj2[key] !== 'object' && obj1[key] !== obj2[key]) {
      differences[key] = { status: 'modified', oldValue: obj1[key], newValue: obj2[key] };
    }
    // For objects, recursively check
    else if (typeof obj2[key] === 'object' && obj2[key] !== null && typeof obj1[key] === 'object' && obj1[key] !== null) {
      const nestedDiffs = findDifferences(obj1[key], obj2[key]);
      if (Object.keys(nestedDiffs).length > 0) {
        differences[key] = { status: 'modified', oldValue: obj1[key], newValue: obj2[key] };
      }
    }
  });
  
  return differences;
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
  changes.isRevision = true;
  
  // Compare work areas
  const currentWorkAreas = Array.isArray(currentData.work_areas) ? currentData.work_areas : [];
  const previousWorkAreas = Array.isArray(previousData.work_areas) ? previousData.work_areas : [];
  
  currentWorkAreas.forEach((workArea: any, index: number) => {
    const id = workArea.id || `index-${index}`;
    const previousWorkArea = previousWorkAreas.find((area: any) => 
      (area.id && area.id === id) || (!area.id && index === previousWorkAreas.indexOf(area))
    );
    
    if (!previousWorkArea) {
      changes.workAreas[id] = { status: 'added', details: workArea };
    } else if (objectsAreDifferent(previousWorkArea, workArea)) {
      changes.workAreas[id] = { 
        status: 'modified', 
        details: findDifferences(previousWorkArea, workArea)
      };
    } else {
      changes.workAreas[id] = { status: 'unchanged' };
    }
  });
  
  // Compare labor items
  const currentLaborItems = Array.isArray(currentData.labor_items) ? currentData.labor_items : [];
  const previousLaborItems = Array.isArray(previousData.labor_items) ? previousData.labor_items : [];
  
  currentLaborItems.forEach((laborItem: any, index: number) => {
    const id = laborItem.id || `index-${index}`;
    const previousLaborItem = previousLaborItems.find((item: any) => 
      (item.id && item.id === id) || (!item.id && index === previousLaborItems.indexOf(item))
    );
    
    if (!previousLaborItem) {
      changes.laborItems[id] = { status: 'added', details: laborItem };
    } else if (objectsAreDifferent(previousLaborItem, laborItem)) {
      changes.laborItems[id] = { 
        status: 'modified', 
        details: findDifferences(previousLaborItem, laborItem)
      };
    } else {
      changes.laborItems[id] = { status: 'unchanged' };
    }
  });
  
  // Compare material items
  const currentMaterialItems = Array.isArray(currentData.material_items) ? currentData.material_items : [];
  const previousMaterialItems = Array.isArray(previousData.material_items) ? previousData.material_items : [];
  
  currentMaterialItems.forEach((materialItem: any, index: number) => {
    const id = materialItem.id || `index-${index}`;
    const previousMaterialItem = previousMaterialItems.find((item: any) => 
      (item.id && item.id === id) || (!item.id && index === previousMaterialItems.indexOf(item))
    );
    
    if (!previousMaterialItem) {
      changes.materialItems[id] = { status: 'added', details: materialItem };
    } else if (objectsAreDifferent(previousMaterialItem, materialItem)) {
      changes.materialItems[id] = { 
        status: 'modified', 
        details: findDifferences(previousMaterialItem, materialItem)
      };
    } else {
      changes.materialItems[id] = { status: 'unchanged' };
    }
  });
  
  // Compare bid configuration
  const prevBidConfig = previousData.bid_configuration || {};
  const currentBidConfig = currentData.bid_configuration || {};
  
  if (objectsAreDifferent(prevBidConfig, currentBidConfig)) {
    changes.bidConfiguration = {
      status: 'modified',
      fields: {}
    };
    
    // Find which specific fields changed
    Object.keys(currentBidConfig).forEach(key => {
      if (!(key in prevBidConfig) || prevBidConfig[key] !== currentBidConfig[key]) {
        changes.bidConfiguration.fields![key] = {
          status: key in prevBidConfig ? 'modified' : 'added',
          oldValue: key in prevBidConfig ? prevBidConfig[key] : undefined,
          newValue: currentBidConfig[key]
        };
      }
    });
  }
  
  return changes;
};
