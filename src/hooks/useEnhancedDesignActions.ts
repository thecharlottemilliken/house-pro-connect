
import { useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { normalizeAreaName } from '@/lib/utils';
import { FileWithPreview } from '@/components/ui/file-upload';

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
    console.log("Photos being selected:", photos);
    
    // Filter out any invalid photo URLs
    const validPhotos = photos.filter(url => url && typeof url === 'string');
    console.log("Valid photos being selected:", validPhotos);
    
    // Call the original handler
    const updatedPrefs = await handleSelectBeforePhotos(area, validPhotos, projectData?.design_preferences || {});
    
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
  }, [handleSelectBeforePhotos, projectData?.design_preferences, refreshProjectData]);

  // Enhanced upload before photos handler with improved debugging and refresh mechanism
  const enhancedUploadBeforePhotos = useCallback(async (area: string, photos: string[]) => {
    console.log(`ProjectDesign: Uploading ${photos.length} before photos for area ${area}`);
    console.log("Photo URLs to upload:", photos);
    
    // Filter out any invalid photo URLs
    const validPhotos = photos.filter(url => url && typeof url === 'string');
    console.log("Valid photos being uploaded:", validPhotos);
    
    if (validPhotos.length === 0) {
      console.warn("No valid photos to upload");
      return null;
    }
    
    // Call the original handler
    const updatedPrefs = await handleUploadBeforePhotos(area, validPhotos, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Before photos uploaded successfully, triggering UI refresh");
      // Force a UI refresh after successful upload
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleUploadBeforePhotos, projectData?.design_preferences, refreshProjectData]);

  // Enhanced tag update handler to trigger UI refresh
  const enhancedUpdateAssetTags = useCallback(async (index: number, tags: string[]) => {
    console.log("ProjectDesign: Updating tags for asset at index", index, "with tags", tags);
    const updatedPrefs = await handleUpdateAssetTags(index, tags, projectData?.design_preferences || {});
    if (updatedPrefs) {
      // Force a UI refresh after successful tag update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    return updatedPrefs;
  }, [handleUpdateAssetTags, projectData?.design_preferences, refreshProjectData]);

  // Enhanced measurements save handler with immediate state update and better type checking
  const enhancedSaveMeasurements = useCallback(async (area: string, measurements: any) => {
    console.log("ProjectDesign: Saving measurements for area", area, JSON.stringify(measurements, null, 2));
    
    // Ensure all numeric values are actually numbers
    const normalizedMeasurements = {
      ...measurements,
      length: typeof measurements.length === 'string' ? parseFloat(measurements.length) || undefined : measurements.length,
      width: typeof measurements.width === 'string' ? parseFloat(measurements.width) || undefined : measurements.width,
      height: typeof measurements.height === 'string' ? parseFloat(measurements.height) || undefined : measurements.height,
      unit: measurements.unit || 'ft'
    };
    
    console.log("ProjectDesign: Normalized measurements:", JSON.stringify(normalizedMeasurements, null, 2));
    
    const updatedPrefs = await handleSaveMeasurements(area, normalizedMeasurements, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Measurements saved successfully, updating UI");
      // Force a UI refresh after successful measurements update
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleSaveMeasurements, projectData?.design_preferences, refreshProjectData]);

  // Enhanced project files handler that properly triggers UI updates
  const enhancedAddProjectFiles = useCallback(async (area: string, files: string[]) => {
    console.log(`ProjectDesign: Adding ${files.length} project files for area ${area}`);
    
    const updatedPrefs = await handleAddProjectFiles(area, files, projectData?.design_preferences || {});
    
    if (updatedPrefs) {
      console.log("ProjectDesign: Project files added successfully, triggering UI refresh");
      // Force a UI refresh after successful file addition
      setRefreshTrigger(prev => prev + 1);
      
      // Also trigger a project data refresh to ensure we have the latest data
      if (refreshProjectData) {
        setTimeout(() => refreshProjectData(), 300);
      }
    }
    
    return updatedPrefs;
  }, [handleAddProjectFiles, projectData?.design_preferences, refreshProjectData]);

  return {
    enhancedSelectBeforePhotos,
    enhancedUploadBeforePhotos,
    enhancedUpdateAssetTags,
    enhancedSaveMeasurements,
    enhancedAddProjectFiles,
    refreshTrigger
  };
};
