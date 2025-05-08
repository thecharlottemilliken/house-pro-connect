
import React, { useState } from 'react';
import { X, Plus } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface TagsDialogContentProps {
  tags: string[];
  onSave: (tags: string[]) => void;
  onCancel: () => void;
}

const TagsDialogContent: React.FC<TagsDialogContentProps> = ({
  tags: initialTags,
  onSave,
  onCancel
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');

  // Common tag suggestions for design assets
  const tagSuggestions = [
    "Blueprint", "Floor Plan", "Rendering", "3D Model", "Drawing",
    "Material", "Finish", "Fixture", "Layout", "Concept", 
    "Kitchen", "Bathroom", "Living Room", "Bedroom", "Exterior"
  ].sort();

  // Add multiple custom tags at once
  const handleAddMultipleTags = () => {
    if (!newTag.trim()) return;
    
    // Split by commas and filter out empty strings
    const tagsToAdd = newTag
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    // Add only unique tags
    const uniqueNewTags = tagsToAdd.filter(tag => !selectedTags.includes(tag));
    
    if (uniqueNewTags.length > 0) {
      setSelectedTags(prev => [...prev, ...uniqueNewTags]);
      setNewTag('');
    }
  };

  // Remove a tag
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Toggle common tag
  const handleToggleTag = (tag: string, checked: boolean) => {
    if (checked && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    } else if (!checked && selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    }
  };

  // Save tags
  const handleSaveTags = () => {
    console.log("Saving tags in dialog:", selectedTags);
    onSave(selectedTags);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Manage Tags</DialogTitle>
      </DialogHeader>
      
      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2 min-h-[60px] border p-3 rounded-md">
          {selectedTags.length === 0 ? (
            <span className="text-gray-400 text-sm">No tags added yet</span>
          ) : (
            selectedTags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="bg-gray-50 text-gray-700 hover:bg-gray-50 flex items-center gap-1 py-0 h-6"
              >
                {tag}
                <button 
                  onClick={() => handleRemoveTag(tag)} 
                  className="ml-1 text-gray-400 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Add Custom Tags</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tags (comma separated)..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMultipleTags();
                }
              }}
            />
            <Button onClick={handleAddMultipleTags} size="sm" className="px-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Common tags:</p>
          <div className="max-h-[180px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {tagSuggestions.map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tag-${tag}`} 
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={(checked) => 
                      handleToggleTag(tag, checked === true)
                    } 
                  />
                  <label 
                    htmlFor={`tag-${tag}`}
                    className="text-sm cursor-pointer"
                  >
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter className="flex justify-between mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSaveTags} className="bg-[#174c65] hover:bg-[#174c65]/90">
          Save Tags
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default TagsDialogContent;
