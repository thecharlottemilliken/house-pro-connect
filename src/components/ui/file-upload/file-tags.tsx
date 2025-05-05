
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileTagsProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

export function FileTags({ tags, onRemoveTag }: FileTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'drawing':
      case 'drawings':
        return 'bg-blue-100 text-blue-800';
      case 'rendering':
      case 'renderings':
        return 'bg-purple-100 text-purple-800';
      case 'architectural':
        return 'bg-green-100 text-green-800';
      case 'blueprint':
      case 'blueprints':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center text-xs px-2 py-0.5 rounded ${getTagColor(tag)}`}
        >
          {tag}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
            onClick={() => onRemoveTag(tag)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove</span>
          </Button>
        </span>
      ))}
    </div>
  );
}
