import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Search, Tag } from "lucide-react";
import { getTagDefinition, createTagId, TagsMetadata, TagCategory } from "@/utils/assetTagUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
  const [workingTags, setWorkingTags] = React.useState<string[]>(initialTags);
  const [newTagInput, setNewTagInput] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<TagCategory | 'all'>('all');
  
  // Get available tags from metadata, excluding already selected tags
  const availableTags = React.useMemo(() => {
    const metadata = defaultTagsMetadata;
    
    return Object.values(metadata.tags)
      .filter(tag => {
        // Filter by search query
        if (searchQuery && !tag.label.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Filter by category if not showing all
        if (activeCategory !== 'all' && tag.category !== activeCategory) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [searchQuery, activeCategory]);

  // Get tag definitions for currently selected tags
  const selectedTagDefinitions = React.useMemo(() => {
    return workingTags.map(tagId => getTagDefinition(tagId, defaultTagsMetadata));
  }, [workingTags]);

  // Toggle a tag selection
  const toggleTag = (tagId: string) => {
    if (workingTags.includes(tagId)) {
      setWorkingTags(workingTags.filter(id => id !== tagId));
    } else {
      setWorkingTags([...workingTags, tagId]);
    }
  };

  // Add a new custom tag
  const addCustomTag = () => {
    if (!newTagInput.trim()) return;
    
    // If the input already has a category prefix, use it as is
    if (newTagInput.includes(':')) {
      toggleTag(newTagInput.trim().toLowerCase());
    } else {
      // Otherwise, add it as a custom tag
      const customTagId = createTagId('custom', newTagInput.trim());
      toggleTag(customTagId);
    }
    
    setNewTagInput('');
  };
  
  const handleSaveTags = () => {
    // Ensure we have at least one type tag if assetType is provided
    if (assetType && !workingTags.some(tag => tag.startsWith('type:'))) {
      onSave([...workingTags, `type:${assetType}`]);
    } else {
      onSave(workingTags);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Manage Tags</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-2">
        {/* Selected tags display */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Selected Tags</label>
          <div className="flex flex-wrap gap-2 min-h-12 p-2 border rounded-md">
            {selectedTagDefinitions.length === 0 ? (
              <span className="text-sm text-gray-400">No tags selected</span>
            ) : (
              selectedTagDefinitions.map(tag => (
                <span 
                  key={tag.id} 
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                  style={{ 
                    backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                    color: tag.color || '#374151',
                    borderLeft: `3px solid ${tag.color || '#9ca3af'}`
                  }}
                >
                  {tag.label}
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="ml-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
        
        {/* Search and add new tag */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="relative flex-1">
              <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Add custom tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                className="pl-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!newTagInput.trim()}
                onClick={addCustomTag}
                className="absolute right-0.5 top-0.5 h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tag category tabs */}
        <Tabs defaultValue="all" value={activeCategory} onValueChange={(value) => setActiveCategory(value as TagCategory | 'all')}>
          <TabsList className="w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="type">Type</TabsTrigger>
            <TabsTrigger value="room">Room</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="material">Material</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[200px] mt-2">
            <div className="grid grid-cols-2 gap-2 p-1">
              {availableTags.map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant="outline"
                  className={`justify-start text-xs h-8 px-2.5 ${
                    workingTags.includes(tag.id) ? 'border-2' : ''
                  }`}
                  style={{
                    borderLeftColor: tag.color || '#9ca3af',
                    borderLeftWidth: tag.color ? '3px' : undefined
                  }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.label}
                </Button>
              ))}
              
              {availableTags.length === 0 && (
                <div className="col-span-2 flex items-center justify-center h-20 text-gray-500">
                  {searchQuery ? "No matching tags found" : "No tags available"}
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </div>
      
      <DialogFooter className="flex justify-between sm:justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSaveTags}>
          Save Tags
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default TagsDialogContent;
