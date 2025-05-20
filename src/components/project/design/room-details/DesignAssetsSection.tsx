
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import FileSelectionDialog from "./SelectProjectFilesDialog";
import AssetPreviewDialog from "./AssetPreviewDialog";
import AssetsList from "./AssetsList";
import AssetUploadButtons from "./AssetUploadButtons";
import TagsDialogContent from "./TagsDialogContent";
import { useDesignAssets } from "./useDesignAssets";

interface DesignAssetsProps {
  designAssets?: Array<{ name: string; url: string; tags?: string[]; }>;
  onRemoveDesignAsset?: (index: number) => void;
  onUpdateAssetTags?: (assetIndex: number, tags: string[]) => void;
  projectId?: string;
  propertyId?: string; // Add propertyId prop
  onSelectProjectFiles?: (files: string[]) => void;
}

const DesignAssetsSection: React.FC<DesignAssetsProps> = ({
  designAssets = [],
  onRemoveDesignAsset,
  onUpdateAssetTags,
  projectId,
  propertyId,
  onSelectProjectFiles
}) => {
  const {
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
  } = useDesignAssets(onSelectProjectFiles, propertyId); // Pass propertyId to hook

  const handleSaveTags = (tags: string[]) => {
    if (onUpdateAssetTags && selectedAssetIndex >= 0) {
      console.log("Saving tags for asset:", selectedAssetIndex, tags);
      onUpdateAssetTags(selectedAssetIndex, tags);
      setTagDialogOpen(false);
    }
  };

  // Added debug console.log to verify component rendering with updated assets
  console.log("DesignAssetsSection rendering with assets:", designAssets);
  console.log("DesignAssetsSection propertyId:", propertyId);

  return (
    <div className="pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-black">Design Assets</h3>
        <Button variant="ghost" className="text-sm font-medium text-gray-600 hover:text-black p-1 h-auto">
          Edit
        </Button>
      </div>
      
      <AssetsList 
        designAssets={designAssets}
        onViewAsset={handleViewAsset}
        onManageTags={openTagDialog}
        onRemoveAsset={(index) => onRemoveDesignAsset && onRemoveDesignAsset(index)}
      />

      <AssetUploadButtons
        onOpenFileSelector={openFileSelector}
        onOpenFileUpload={openFileUploader}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*, .pdf, .dwg, .doc, .docx, .xls"
        multiple
        onChange={handleQuickUpload}
        className="hidden"
      />

      {/* Tags Management Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <TagsDialogContent 
          tags={selectedAssetIndex >= 0 && selectedAssetIndex < designAssets.length
            ? designAssets[selectedAssetIndex]?.tags || []
            : []}
          onSave={handleSaveTags}
          onCancel={() => setTagDialogOpen(false)}
        />
      </Dialog>

      {/* Asset Preview Dialog */}
      <AssetPreviewDialog 
        asset={previewAsset} 
        onOpenChange={() => setPreviewAsset(null)} 
      />

      {/* Project Files Selection Dialog */}
      {projectId && (
        <FileSelectionDialog
          open={showProjectFilesDialog}
          onOpenChange={setShowProjectFilesDialog}
          projectId={projectId}
          propertyId={propertyId}
          onSelect={(files) => {
            if (onSelectProjectFiles) {
              onSelectProjectFiles(files);
            }
            setShowProjectFilesDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default DesignAssetsSection;
