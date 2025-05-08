
import React, { useState } from 'react';
import { X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTags: string[];
  onSaveTags: (tags: string[]) => void;
  commonTagSuggestions?: string[];
}

const TagsDialog: React.FC<TagsDialogProps> = ({
  open,
  onOpenChange,
  selectedTags: initialTags,
  onSaveTags,
  commonTagSuggestions = []
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');

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
    onSaveTags(selectedTags);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2 min-h-[60px] border p-2 rounded-md">
            {selectedTags.length === 0 ? (
              <span className="text-gray-400 text-sm">No tags added yet</span>
            ) : (
              selectedTags.map((tag) => (
                <span key={tag} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md text-sm">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-gray-500 hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
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
          
          {commonTagSuggestions.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Common tags:</p>
              <div className="flex flex-wrap gap-2">
                {commonTagSuggestions.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddCommonTag(tag)}
                    className={`text-xs px-2 py-1 rounded-md border ${
                      selectedTags.includes(tag) 
                        ? 'bg-[#174c65] text-white border-[#174c65]' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveTags} className="bg-[#174c65] hover:bg-[#174c65]/90">
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagsDialog;
