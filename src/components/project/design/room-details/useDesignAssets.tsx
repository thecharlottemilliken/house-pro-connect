
import { useState, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useDesignAssets(
  onSelectProjectFiles?: (files: string[]) => void,
  propertyId?: string // Add propertyId param
) {
  const [previewAsset, setPreviewAsset] = useState<any>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState<boolean>(false);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(-1);
  const [showProjectFilesDialog, setShowProjectFilesDialog] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileUploader = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const openFileSelector = useCallback(() => {
    setShowProjectFilesDialog(true);
  }, []);

  const openTagDialog = useCallback((index: number) => {
    setSelectedAssetIndex(index);
    setTagDialogOpen(true);
  }, []);

  const handleViewAsset = useCallback((asset: any) => {
    setPreviewAsset(asset);
  }, []);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const uploadedUrls: string[] = [];
    
    try {
      toast({
        title: "Uploading files",
        description: "Please wait while your files are being uploaded..."
      });
      
      // If propertyId is provided, upload files to Supabase storage
      if (propertyId) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `${propertyId}/${fileName}`;
          
          // Upload to Supabase storage
          const { data, error } = await supabase
            .storage
            .from('property-files')
            .upload(filePath, file);
            
          if (error) {
            console.error("Storage upload error:", error);
            toast({
              title: "Upload failed",
              description: error.message,
              variant: "destructive"
            });
            continue; // Skip to the next file
          }
          
          // Get public URL
          const { data: urlData } = supabase
            .storage
            .from('property-files')
            .getPublicUrl(filePath);
            
          if (urlData && urlData.publicUrl) {
            uploadedUrls.push(urlData.publicUrl);
          }
        }
      } else {
        // Fallback to creating temporary URLs if propertyId not available
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const tempUrl = URL.createObjectURL(file);
          uploadedUrls.push(tempUrl);
          console.warn("Creating temporary URL - may not persist:", tempUrl);
        }
        
        toast({
          title: "Warning",
          description: "PropertyId not available - files may not be saved permanently",
          duration: 5000,
        });
      }
      
      // If we have URLs and a callback, call it
      if (uploadedUrls.length > 0 && onSelectProjectFiles) {
        onSelectProjectFiles(uploadedUrls);
        toast({
          title: "Upload complete",
          description: `${uploadedUrls.length} file(s) uploaded successfully`
        });
      }
    } catch (error) {
      console.error("Error during file upload process:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive"
      });
    } finally {
      // Clear the file input
      if (e.target) e.target.value = "";
    }
  };

  return {
    fileInputRef,
    previewAsset,
    setPreviewAsset,
    tagDialogOpen,
    setTagDialogOpen,
    selectedAssetIndex,
    showProjectFilesDialog,
    setShowProjectFilesDialog,
    handleQuickUpload,
    openFileUploader,
    openFileSelector,
    openTagDialog,
    handleViewAsset
  };
}
