

import { SOWData } from '@/hooks/useSOWData';

// Define the structure for tracked changes - more detailed with status field
export interface ChangeTracker {
  workAreas: {
    [key: string]: { status: 'added' | 'modified' | 'unchanged' | 'removed', details?: any };
  };
  laborItems: {
    [key: string]: { status: 'added' | 'modified' | 'unchanged' | 'removed', details?: any };
  };
  materialItems: {
    [key: string]: { status: 'added' | 'modified' | 'unchanged' | 'removed', details?: any };
  };
  bidConfiguration: { 
    status: 'modified' | 'unchanged';
    fields?: {
      [key: string]: { status: 'added' | 'modified' | 'unchanged' | 'removed', oldValue?: any, newValue?: any }
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
export const findDifferences = (obj1: any, obj2: any): { [key: string]: { status: 'added' | 'modified' | 'removed', oldValue?: any, newValue?: any } } => {
  const differences: { [key: string]: { status: 'added' | 'modified' | 'removed', oldValue?: any, newValue?: any } } = {};
  
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
  
  // Check for removed fields
  Object.keys(obj1).forEach(key => {
    if (!(key in obj2)) {
      differences[key] = { status: 'removed', oldValue: obj1[key] };
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

// Generate a unique key for an item for better tracking
export const generateItemKey = (item: any, index: number): string => {
  if (item.id) return item.id;
  if (item.category && item.type) return `${item.category}-${item.type}`;
  return `index-${index}`;
};

// Track changes between previous and current SOW data
export const trackChanges = (previousData: SOWData | null, currentData: SOWData | null): ChangeTracker => {
  console.log("Tracking changes between versions:", 
    { previous: previousData ? "exists" : "null", current: currentData ? "exists" : "null" });
  
  const changes = initializeChangeTracker();
  
  if (!previousData || !currentData) {
    console.log("Missing data for comparison, returning empty changes");
    return changes;
  }
  
  // Check if this is a revision based on previous status
  changes.isRevision = true;
  
  // Compare work areas
  const currentWorkAreas = Array.isArray(currentData.work_areas) ? currentData.work_areas : [];
  const previousWorkAreas = Array.isArray(previousData.work_areas) ? previousData.work_areas : [];
  
  console.log(`Comparing work areas: Previous ${previousWorkAreas.length}, Current ${currentWorkAreas.length}`);
  
  // Track added and modified work areas
  currentWorkAreas.forEach((workArea: any, index: number) => {
    const id = generateItemKey(workArea, index);
    const previousWorkArea = previousWorkAreas.find((area: any) => 
      (area.id && area.id === id) || 
      (area.id && workArea.id && area.id === workArea.id) ||
      (!area.id && index === previousWorkAreas.indexOf(area))
    );
    
    if (!previousWorkArea) {
      console.log(`Work area added: ${id}`);
      changes.workAreas[id] = { status: 'added', details: workArea };
    } else if (objectsAreDifferent(previousWorkArea, workArea)) {
      console.log(`Work area modified: ${id}`);
      changes.workAreas[id] = { 
        status: 'modified', 
        details: findDifferences(previousWorkArea, workArea)
      };
    } else {
      changes.workAreas[id] = { status: 'unchanged' };
    }
  });
  
  // Track removed work areas
  previousWorkAreas.forEach((workArea: any, index: number) => {
    const id = generateItemKey(workArea, index);
    const stillExists = currentWorkAreas.some((area: any) => 
      (area.id && area.id === id) || 
      (area.id && workArea.id && area.id === workArea.id) ||
      (JSON.stringify(area) === JSON.stringify(workArea))
    );
    
    if (!stillExists && !changes.workAreas[id]) {
      console.log(`Work area removed: ${id}`);
      changes.workAreas[id] = { status: 'removed', details: workArea };
    }
  });
  
  // Compare labor items
  const currentLaborItems = Array.isArray(currentData.labor_items) ? currentData.labor_items : [];
  const previousLaborItems = Array.isArray(previousData.labor_items) ? previousData.labor_items : [];
  
  console.log(`Comparing labor items: Previous ${previousLaborItems.length}, Current ${currentLaborItems.length}`);
  
  // Create maps for easier comparison
  const previousLaborMap: Record<string, any> = {};
  previousLaborItems.forEach((item: any, index: number) => {
    const key = item.category && item.type ? `${item.category}-${item.type}` : `index-${index}`;
    previousLaborMap[key] = item;
  });
  
  // Track added and modified labor items
  currentLaborItems.forEach((laborItem: any, index: number) => {
    const key = laborItem.category && laborItem.type ? `${laborItem.category}-${laborItem.type}` : `index-${index}`;
    
    if (!previousLaborMap[key]) {
      console.log(`Labor item added: ${key}`);
      changes.laborItems[key] = { status: 'added', details: laborItem };
    } else if (objectsAreDifferent(previousLaborMap[key], laborItem)) {
      console.log(`Labor item modified: ${key}`);
      changes.laborItems[key] = { 
        status: 'modified', 
        details: findDifferences(previousLaborMap[key], laborItem)
      };
    } else {
      changes.laborItems[key] = { status: 'unchanged' };
    }
  });
  
  // Track removed labor items
  Object.keys(previousLaborMap).forEach(key => {
    const stillExists = currentLaborItems.some((item: any) => 
      (item.category && item.type && `${item.category}-${item.type}` === key)
    );
    
    if (!stillExists) {
      console.log(`Labor item removed: ${key}`);
      changes.laborItems[key] = { status: 'removed', details: previousLaborMap[key] };
    }
  });
  
  // Compare material items
  const currentMaterialItems = Array.isArray(currentData.material_items) ? currentData.material_items : [];
  const previousMaterialItems = Array.isArray(previousData.material_items) ? previousData.material_items : [];
  
  console.log(`Comparing material items: Previous ${previousMaterialItems.length}, Current ${currentMaterialItems.length}`);
  
  // Create maps for easier comparison
  const previousMaterialMap: Record<string, any> = {};
  previousMaterialItems.forEach((item: any, index: number) => {
    const key = item.category && item.type ? `${item.category}-${item.type}` : `index-${index}`;
    previousMaterialMap[key] = item;
  });
  
  // Track added and modified material items
  currentMaterialItems.forEach((materialItem: any, index: number) => {
    const key = materialItem.category && materialItem.type ? `${materialItem.category}-${materialItem.type}` : `index-${index}`;
    
    if (!previousMaterialMap[key]) {
      console.log(`Material item added: ${key}`);
      changes.materialItems[key] = { status: 'added', details: materialItem };
    } else if (objectsAreDifferent(previousMaterialMap[key], materialItem)) {
      console.log(`Material item modified: ${key}`);
      changes.materialItems[key] = { 
        status: 'modified', 
        details: findDifferences(previousMaterialMap[key], materialItem)
      };
    } else {
      changes.materialItems[key] = { status: 'unchanged' };
    }
  });
  
  // Track removed material items
  Object.keys(previousMaterialMap).forEach(key => {
    const stillExists = currentMaterialItems.some((item: any) => 
      (item.category && item.type && `${item.category}-${item.type}` === key)
    );
    
    if (!stillExists) {
      console.log(`Material item removed: ${key}`);
      changes.materialItems[key] = { status: 'removed', details: previousMaterialMap[key] };
    }
  });
  
  // Compare bid configuration
  const prevBidConfig = previousData.bid_configuration || {};
  const currentBidConfig = currentData.bid_configuration || {};
  
  if (objectsAreDifferent(prevBidConfig, currentBidConfig)) {
    console.log("Bid configuration changed");
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
    
    // Check for removed fields
    Object.keys(prevBidConfig).forEach(key => {
      if (!(key in currentBidConfig)) {
        changes.bidConfiguration.fields![key] = {
          status: 'removed',
          oldValue: prevBidConfig[key]
        };
      }
    });
  }
  
  console.log("Change tracking complete", changes);
  return changes;
};

// Helper functions to check if items have changes
export const hasWorkAreaChanges = (changes: ChangeTracker, id: string): boolean => {
  return !!(changes?.workAreas[id] && changes.workAreas[id].status !== 'unchanged');
};

export const hasLaborItemChanges = (changes: ChangeTracker, id: string): boolean => {
  return !!(changes?.laborItems[id] && changes.laborItems[id].status !== 'unchanged');
};

export const hasMaterialItemChanges = (changes: ChangeTracker, id: string): boolean => {
  return !!(changes?.materialItems[id] && changes.materialItems[id].status !== 'unchanged');
};

export const hasBidConfigChanges = (changes: ChangeTracker): boolean => {
  return changes?.bidConfiguration?.status === 'modified';
};
