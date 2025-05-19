
import React, { useEffect } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EnhancedTagsDialog from '@/components/project/design/EnhancedTagsDialog';
import { defaultTagsMetadata } from '@/utils/assetTagUtils';

interface TagsDialogContentProps {
  tags: string[];
  onSave: (tags: string[]) => void;
  onCancel: () => void;
  assetType?: string;
}

const TagsDialogContent: React.FC<TagsDialogContentProps> = ({
  tags: initialTags,
  onSave,
  onCancel,
  assetType
}) => {
  // We're repurposing this component to use our enhanced tags dialog directly
  // This maintains compatibility with existing code while using our new system
  console.log("TagsDialog received initial tags:", initialTags);
  
  const handleSave = (newTags: string[]) => {
    console.log("Saving tags:", newTags);
    onSave(newTags);
  };

  return (
    <EnhancedTagsDialog 
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      selectedTags={initialTags}
      onSaveTags={handleSave}
      tagsMetadata={defaultTagsMetadata}
      assetType={assetType}
    />
  );
};

export default TagsDialogContent;
