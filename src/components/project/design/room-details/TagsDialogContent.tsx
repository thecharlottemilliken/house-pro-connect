
import React, { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface TagsDialogContentProps {
  tags: string[];
  onSave: (tags: string[]) => void;
  onCancel: () => void;
}

const TagsDialogContent: React.FC<TagsDialogContentProps> = ({
  tags: initialTags,
  onSave,
  onCancel,
}) => {
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [newTag, setNewTag] = useState("");
  
  // Update local tags when initialTags prop changes
  useEffect(() => {
    console.log("TagsDialog received initial tags:", initialTags);
    setTags(initialTags || []);
  }, [initialTags]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    console.log("Saving tags:", tags);
    onSave(tags);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Manage Tags</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Add tag..." 
            value={newTag} 
            onChange={(e) => setNewTag(e.target.value)} 
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddTag}
            disabled={!newTag.trim() || tags.includes(newTag.trim())}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Tag</span>
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="px-2 py-1 text-sm">
              {tag}
              <button 
                type="button" 
                onClick={() => handleRemoveTag(tag)} 
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            </Badge>
          ))}
          {tags.length === 0 && (
            <div className="text-sm text-gray-500">No tags added yet</div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Tags
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default TagsDialogContent;
