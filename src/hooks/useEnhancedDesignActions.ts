
import { useState, useCallback, useEffect } from 'react';
import { useDesignActions } from '@/hooks/useDesignActions';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getBeforePhotos, 
  removeBeforePhoto, 
  reorderBeforePhotos, 
  migrateBeforePhotosKeys 
} from '@/utils/BeforePhotosService';
import { normalizeAreaName } from '@/lib/utils';

export const useEnhancedDesignActions = (
  handleSaveMeasurements: any,
  handleSelectBeforePhotos: any,
  handleUploadBeforePhotos: any,
  handleAddProjectFiles: any,
  handleUpdateAssetTags: any,
  projectData: any,
  refreshProjectData: any
) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUpdatingBeforePhotos, setIsUpdatingBeforePhotos] = useState(false);

  // Migrate beforePhotos keys to normalized format if needed
  const migrateBeforePhotosIfNeeded = useCallback(async () => {
    if (!projectData?.id || !projectData?.design_preferences?.beforePhotos) {
      return;
    }
    
    console.log("EnhancedDesignActions: Checking if beforePhotos needs migration");
    
    // Create migrated copy
    const migratedPrefs = migrateBeforePhotosKeys(projectData.design_preferences);
    
    // Check if anything changed during migration
    const beforeJson = JSON.stringify(projectData.design_preferences.beforePhotos);
    const afterJson = JSON.stringify(migratedPrefs.beforePhotos);
    
    if (beforeJson !== afterJson) {
      console.log("EnhancedDesignActions: Migration needed, updating design preferences");
      // Save the migrated preferences
      const { data, error } = await supabase
        .from('projects')
        .update({ design_preferences: migratedPrefs })
        .eq('id', projectData.id);
        
      if (error) {
        console.error("Error migrating beforePhotos:", error);
      } else {
        console.log("EnhancedDesignActions: Migration successful");
        // Force a refresh to get the updated data
        refreshProjectData();
      }
    } else {
      console.log("EnhancedDesignActions: No migration needed");
    }
  }, [projectData, refreshProjectData]);

  // Call migration on initial load
  useEffect(() => {
    migrateBeforePhotosIfNeeded();
  }, [migrateBeforePhotosIfNeeded]);

  // Enhanced room measurement handler
  const handleRoomMeasurements = useCallback(async (area: string, measurements: any) => {
    if (!projectData?.id) return;
    
    // Normalize area name for consistency
    const normalizedArea = normalizeAreaName(area);
    console.log(`EnhancedDesignActions: Saving measurements for normalized area ${normalizedArea} (from ${area})`);
    
    const updatedPrefs = await handleSaveMeasurements(
      normalizedArea,
      measurements,
      projectData.design_preferences || {}
    );
    
    if (updatedPrefs) {
      setRefreshTrigger(prev => prev + 1);
      refreshProjectData();
    }
  }, [projectData, handleSaveMeasurements, refreshProjectData]);

  // Enhanced before photos handlers
  const getBeforePhotosForArea = useCallback((area: string) => {
    if (!projectData?.design_preferences) {
      console.log("EnhancedDesignActions: No design preferences found for getBeforePhotosForArea");
      return [];
    }
    
    console.log(`EnhancedDesignActions: Getting photos for area ${area}`);
    const photos = getBeforePhotos(area, projectData.design_preferences);
    console.log(`EnhancedDesignActions: Got ${photos.length} photos for area ${area}`);
    return photos;
  }, [projectData]);

  const selectBeforePhotos = useCallback(async (area: string, photos: string[]) => {
    console.log(`EnhancedDesignActions: selectBeforePhotos called for area ${area} with ${photos.length} photos`);
    
    if (!projectData?.id) {
      console.error("EnhancedDesignActions: No project ID available for selectBeforePhotos");
      return;
    }
    
    setIsUpdatingBeforePhotos(true);
    
    try {
      const updatedPrefs = await handleSelectBeforePhotos(
        area, 
        photos, 
        projectData.design_preferences || {}
      );
      
      if (updatedPrefs) {
        console.log(`EnhancedDesignActions: Successfully updated photos for ${area}`);
        setRefreshTrigger(prev => prev + 1);
        refreshProjectData();
      }
    } finally {
      setIsUpdatingBeforePhotos(false);
    }
  }, [projectData, handleSelectBeforePhotos, refreshProjectData]);

  const uploadBeforePhotos = useCallback(async (area: string, photos: string[]) => {
    console.log(`EnhancedDesignActions: uploadBeforePhotos called for area ${area} with ${photos.length} photos`);
    
    if (!projectData?.id) {
      console.error("EnhancedDesignActions: No project ID available for uploadBeforePhotos");
      return;
    }
    
    setIsUpdatingBeforePhotos(true);
    
    try {
      const updatedPrefs = await handleUploadBeforePhotos(
        area, 
        photos, 
        projectData.design_preferences || {}
      );
      
      if (updatedPrefs) {
        console.log(`EnhancedDesignActions: Successfully uploaded photos for ${area}`);
        setRefreshTrigger(prev => prev + 1);
        refreshProjectData();
      }
    } finally {
      setIsUpdatingBeforePhotos(false);
    }
  }, [projectData, handleUploadBeforePhotos, refreshProjectData]);

  const removePhoto = useCallback(async (area: string, index: number) => {
    console.log(`EnhancedDesignActions: removePhoto called for area ${area} at index ${index}`);
    
    if (!projectData?.id || !projectData?.design_preferences) {
      console.error("EnhancedDesignActions: No project data available for removePhoto");
      return;
    }
    
    setIsUpdatingBeforePhotos(true);
    
    try {
      // Use the BeforePhotosService utility to remove the photo
      const updatedPrefs = removeBeforePhoto(
        area,
        index,
        projectData.design_preferences
      );
      
      // Save the updated preferences
      const { data, error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectData.id);
      
      if (error) {
        console.error("Error removing photo:", error);
        toast({
          title: "Error",
          description: "Failed to remove photo",
          variant: "destructive"
        });
      } else {
        console.log(`EnhancedDesignActions: Successfully removed photo at index ${index} for ${area}`);
        toast({
          title: "Success",
          description: "Photo removed"
        });
        setRefreshTrigger(prev => prev + 1);
        refreshProjectData();
      }
    } finally {
      setIsUpdatingBeforePhotos(false);
    }
  }, [projectData, refreshProjectData]);

  const reorderPhotos = useCallback(async (area: string, fromIndex: number, toIndex: number) => {
    console.log(`EnhancedDesignActions: reorderPhotos called for area ${area} from ${fromIndex} to ${toIndex}`);
    
    if (!projectData?.id || !projectData?.design_preferences) {
      console.error("EnhancedDesignActions: No project data available for reorderPhotos");
      return;
    }
    
    setIsUpdatingBeforePhotos(true);
    
    try {
      // Use the BeforePhotosService utility to reorder the photos
      const updatedPrefs = reorderBeforePhotos(
        area,
        fromIndex,
        toIndex,
        projectData.design_preferences
      );
      
      // Save the updated preferences
      const { data, error } = await supabase
        .from('projects')
        .update({ design_preferences: updatedPrefs })
        .eq('id', projectData.id);
      
      if (error) {
        console.error("Error reordering photos:", error);
        toast({
          title: "Error",
          description: "Failed to reorder photos",
          variant: "destructive"
        });
      } else {
        console.log(`EnhancedDesignActions: Successfully reordered photos for ${area}`);
        setRefreshTrigger(prev => prev + 1);
        refreshProjectData();
      }
    } finally {
      setIsUpdatingBeforePhotos(false);
    }
  }, [projectData, refreshProjectData]);

  // Enhanced project files handler
  const addProjectFiles = useCallback(async (roomId: string, area: string, files: string[]) => {
    console.log(`EnhancedDesignActions: addProjectFiles called for area ${area} with ${files.length} files`);
    
    if (!projectData?.id) {
      console.error("EnhancedDesignActions: No project ID available for addProjectFiles");
      return;
    }
    
    const updatedPrefs = await handleAddProjectFiles(area, files, projectData.design_preferences || {});
    
    if (updatedPrefs) {
      console.log(`EnhancedDesignActions: Successfully added files for ${area}`);
      setRefreshTrigger(prev => prev + 1);
      refreshProjectData();
    }
  }, [projectData, handleAddProjectFiles, refreshProjectData]);

  // Enhanced asset tags handler
  const updateAssetTags = useCallback(async (assetIndex: number, tags: string[]) => {
    console.log(`EnhancedDesignActions: updateAssetTags called for asset ${assetIndex} with ${tags.length} tags`);
    
    if (!projectData?.id) {
      console.error("EnhancedDesignActions: No project ID available for updateAssetTags");
      return;
    }
    
    const updatedPrefs = await handleUpdateAssetTags(
      assetIndex,
      tags,
      projectData.design_preferences || {}
    );
    
    if (updatedPrefs) {
      console.log(`EnhancedDesignActions: Successfully updated tags for asset ${assetIndex}`);
      setRefreshTrigger(prev => prev + 1);
      refreshProjectData();
    }
  }, [projectData, handleUpdateAssetTags, refreshProjectData]);

  return {
    handleRoomMeasurements,
    getBeforePhotosForArea,
    selectBeforePhotos,
    uploadBeforePhotos,
    removePhoto,
    reorderPhotos,
    addProjectFiles,
    updateAssetTags,
    refreshTrigger,
    isUpdatingBeforePhotos
  };
};
