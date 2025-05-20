
import { useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  selectBeforePhotos, 
  addBeforePhotosToPreferences, 
  saveBeforePhotos
} from '@/utils/BeforePhotosService';

/**
 * Custom hook that provides enhanced design action handlers with improved 
 * error handling and state management
 */
export const useEnhancedDesignActions = (
  handleSaveMeasurements: any,
  handleSelectBeforePhotos: any,
  handleUploadBeforePhotos: any,
  handleAddProjectFiles: any,
  handleUpdateAssetTags: any,
  projectData: any,
  refreshProjectData: () => Promise<void>
) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Enhanced select before photos handler with improved debugging and refresh mechanism
  const enhancedSelectBeforePhotos = useCallback(async (area: string, photos: string[]) => {
    console.log(`ProjectDesign: Selecting ${photos.length} before photos for area ${area}`);
    
    if (!projectData?.id) {
      toast({
        title: "Error",
        description: "Project ID is required to save photos",
        variant: "destructive"
      });
      return null;
    }
    
    // Use our new service function
    const updatedPrefs = await selectBeforePhotos(
      area, 
      photos, 
      projectData.id, 
      projectData?.design_preferences || {}
    );
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Before photos updated successfully, triggering UI refresh");
      // Force a UI refresh after successful update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [projectData?.id, projectData?.design_preferences, refreshProjectData]);

  // Enhanced upload before photos handler with improved error handling
  const enhancedUploadBeforePhotos = useCallback(async (area: string, photos: string[]) => {
    console.log(`ProjectDesign: Uploading ${photos.length} before photos for area ${area}`);
    
    if (!projectData?.id) {
      toast({
        title: "Error",
        description: "Project ID is required to save photos",
        variant: "destructive"
      });
      return null;
    }
    
    // Use our new service functions
    const updatedPrefs = addBeforePhotosToPreferences(
      area, 
      photos, 
      projectData?.design_preferences || {}
    );
    
    const success = await saveBeforePhotos(projectData.id, updatedPrefs);
    
    if (success) {
      toast({
        title: "Success",
        description: `Photos added to ${area}`
      });
      
      console.log("ProjectDesign: Before photos uploaded successfully, triggering UI refresh");
      // Force a UI refresh after successful upload
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
      
      return updatedPrefs;
    } else {
      toast({
        title: "Error",
        description: "Failed to save uploaded photos",
        variant: "destructive"
      });
      return null;
    }
  }, [projectData?.id, projectData?.design_preferences, refreshProjectData]);

  // Enhanced tag update handler to trigger UI refresh
  const enhancedUpdateAssetTags = useCallback(async (index: number, tags: string[]) => {
    console.log("ProjectDesign: Updating tags for asset at index", index, "with tags", tags);
    
    if (!projectData?.id) {
      toast({
        title: "Error",
        description: "Project ID is required to update tags",
        variant: "destructive"
      });
      return null;
    }
    
    // Call the original handler
    const updatedPrefs = await handleUpdateAssetTags(index, tags, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Asset tags updated successfully, triggering UI refresh");
      // Force a UI refresh after successful update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleUpdateAssetTags, projectData?.id, projectData?.design_preferences, refreshProjectData]);

  // Enhanced save measurements handler
  const enhancedSaveMeasurements = useCallback(async (area: string, measurements: any) => {
    console.log("ProjectDesign: Saving measurements for area", area);
    
    if (!projectData?.id) {
      toast({
        title: "Error",
        description: "Project ID is required to save measurements",
        variant: "destructive"
      });
      return null;
    }
    
    // Call the original handler
    const updatedPrefs = await handleSaveMeasurements(area, measurements, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Measurements saved successfully, triggering UI refresh");
      // Force a UI refresh after successful update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleSaveMeasurements, projectData?.id, projectData?.design_preferences, refreshProjectData]);

  // Enhanced add project files handler
  const enhancedAddProjectFiles = useCallback(async (area: string, files: string[]) => {
    console.log(`ProjectDesign: Adding ${files.length} project files for area ${area}`);
    
    if (!projectData?.id) {
      toast({
        title: "Error",
        description: "Project ID is required to add files",
        variant: "destructive"
      });
      return null;
    }
    
    // Call the original handler
    const updatedPrefs = await handleAddProjectFiles(area, files, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Project files added successfully, triggering UI refresh");
      // Force a UI refresh after successful update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleAddProjectFiles, projectData?.id, projectData?.design_preferences, refreshProjectData]);

  return {
    enhancedSelectBeforePhotos,
    enhancedUploadBeforePhotos,
    enhancedUpdateAssetTags,
    enhancedSaveMeasurements,
    enhancedAddProjectFiles,
    refreshTrigger
  };
};
