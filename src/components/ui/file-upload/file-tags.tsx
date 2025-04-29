
import React, { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { FileWithPreview } from "./types";

interface FileTagsProps {
  file: FileWithPreview;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function FileTags({ file, onAddTag, onRemoveTag }: FileTagsProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Focus on tag input when adding a new tag
  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag);
      setNewTag("");
    }
    setIsAddingTag(false);
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {file.tags.map((tag) => (
        <Badge key={tag} variant="outline" className="flex items-center gap-1 bg-gray-100">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTag(tag);
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {isAddingTag ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTag();
          }}
          className="flex items-center"
        >
          <Input
            ref={tagInputRef}
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter tag"
            className="h-8 text-xs mr-1 w-28"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={() => setIsAddingTag(false)}>
            <X className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-2 py-1 h-auto text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setIsAddingTag(true);
            setNewTag("");
          }}
        >
          <Plus className="h-3 w-3" /> Add Tag
        </Button>
      )}
    </div>
  );
}
