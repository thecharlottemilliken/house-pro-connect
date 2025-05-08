
import { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useDesignAssets = (onSelectProjectFiles?: (files: string[]) => void) => {
  const [previewAsset, setPreviewAsset] = useState<{name: string; url: string; type: string} | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProjectFilesDialog, setShowProjectFilesDialog] = useState(false);

  const handleQuickUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    // Check authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to upload files.",
        variant: "destructive"
      });
      return;
    }

    const uploadedUrls: {name: string; url: string}[] = [];
    
    try {
      toast({
        title: "Uploading files",
        description: "Please wait while your files are being uploaded."
      });

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${Math.random()}-${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('properties')
            .getPublicUrl(filePath);
          
          uploadedUrls.push({
            name: file.name,
            url: publicUrl
          });
        }
      }

      if (uploadedUrls.length > 0 && onSelectProjectFiles) {
        // Pass urls to associate files
        onSelectProjectFiles(uploadedUrls.map(item => item.url));
      }

      toast({
        title: "Files uploaded successfully",
        description: `${uploadedUrls.length} file(s) have been uploaded.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
    } finally {
      // Reset the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const openFileUploader = () => {
    fileInputRef.current?.click();
  };

  const openFileSelector = () => {
    setShowProjectFilesDialog(true);
  };

  const openTagDialog = (index: number) => {
    setSelectedAssetIndex(index);
    setTagDialogOpen(true);
  };

  const handleViewAsset = (asset: {name: string; url: string; type: string}) => {
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
