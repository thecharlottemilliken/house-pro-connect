
import { useState, useRef } from 'react';

export const useDesignAssets = (onSelectProjectFiles?: (files: string[]) => void) => {
  // File input reference for direct uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Asset preview state
  const [previewAsset, setPreviewAsset] = useState<{ name: string; url: string } | null>(null);
  
  // Tag management dialog state
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(-1);
  
  // Project files dialog state
  const [showProjectFilesDialog, setShowProjectFilesDialog] = useState(false);
  
  // Handle direct file upload
  const handleQuickUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to array of File objects
    const fileArray = Array.from(files);
    
    // Upload files (this would typically use your upload service)
    console.log("Files selected for upload:", fileArray);
    
    // Reset the input
    if (event.target.value) {
      event.target.value = '';
    }
  };
  
  // Open file uploader
  const openFileUploader = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Open file selector dialog
  const openFileSelector = () => {
    setShowProjectFilesDialog(true);
  };
  
  // Open tag management dialog
  const openTagDialog = (index: number) => {
    setSelectedAssetIndex(index);
    setTagDialogOpen(true);
  };
  
  // View asset
  const handleViewAsset = (asset: { name: string; url: string }) => {
    setPreviewAsset(asset);
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
};
