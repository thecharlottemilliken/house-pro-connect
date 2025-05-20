
import { useRef, useState, useCallback } from "react";

export const useDesignAssets = (onSelectProjectFiles?: (files: string[]) => void) => {
  // File input reference for uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Preview state for assets
  const [previewAsset, setPreviewAsset] = useState<{ name: string; url: string } | null>(null);
  
  // Dialog states
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [showProjectFilesDialog, setShowProjectFilesDialog] = useState(false);
  
  // Track which asset we're editing tags for
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(-1);

  // Handle file upload through file input element
  const handleQuickUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Files selected for upload:", files);
      // Here you would handle the file upload
      // For now, just log it
    }
  }, []);

  // Open file uploader
  const openFileUploader = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Open file selector dialog
  const openFileSelector = useCallback(() => {
    setShowProjectFilesDialog(true);
  }, []);

  // Open tag management dialog
  const openTagDialog = useCallback((index: number) => {
    setSelectedAssetIndex(index);
    setTagDialogOpen(true);
  }, []);

  // View asset in preview dialog
  const handleViewAsset = useCallback((asset: { name: string; url: string }) => {
    setPreviewAsset(asset);
  }, []);

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
};

export default useDesignAssets;
