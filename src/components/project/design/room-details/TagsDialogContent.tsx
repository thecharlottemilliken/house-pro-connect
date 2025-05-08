
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
    "Material", "Finish", "Fixture", "Layout", "Concept"
  ];

  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() !== '' && !selectedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove a tag
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Add common tag
  const handleAddCommonTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Save tags
  const handleSaveTags = () => {
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
        
        <div className="flex gap-2">
          <Input
            placeholder="Add a new tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button onClick={handleAddTag} size="sm" className="px-2">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">Common tags:</p>
          <div className="flex flex-wrap gap-2">
            {tagSuggestions.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className={`cursor-pointer ${
                  selectedTags.includes(tag) 
                    ? 'bg-[#174c65] text-white border-[#174c65]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleAddCommonTag(tag)}
              >
                {tag}
              </Badge>
            ))}
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
