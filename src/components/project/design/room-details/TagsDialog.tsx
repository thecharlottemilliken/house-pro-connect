
import React from 'react';
import EnhancedTagsDialog from '@/components/project/design/EnhancedTagsDialog'; 
import { defaultTagsMetadata } from '@/utils/assetTagUtils';

interface TagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTags: string[];
  onSaveTags: (tags: string[]) => void;
  commonTagSuggestions?: string[];
  assetType?: string;
}

const TagsDialog: React.FC<TagsDialogProps> = ({
  open,
  onOpenChange,
  selectedTags,
  onSaveTags,
  commonTagSuggestions = [],
  assetType
}) => {
  // Migrate the common tag suggestions to our tag structure
  const enhancedTagsMetadata = React.useMemo(() => {
    if (!commonTagSuggestions || commonTagSuggestions.length === 0) {
      return defaultTagsMetadata;
    }

    // Clone the metadata
    const customMetadata = JSON.parse(JSON.stringify(defaultTagsMetadata));
    
    // Add the common suggestions as custom tags
    commonTagSuggestions.forEach(tag => {
      const tagId = `custom:${tag.toLowerCase().replace(/\s+/g, '-')}`;
      customMetadata.tags[tagId] = {
        id: tagId,
        label: tag,
        category: 'custom',
        color: customMetadata.categories.custom.color
      };
    });
    
    return customMetadata;
  }, [commonTagSuggestions]);
  
  return (
    <EnhancedTagsDialog 
      open={open}
      onOpenChange={onOpenChange}
      selectedTags={selectedTags}
      onSaveTags={onSaveTags}
      tagsMetadata={enhancedTagsMetadata}
      assetType={assetType}
    />
  );
};

export default TagsDialog;
