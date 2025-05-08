
import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileTagsProps {
  tags: string[];
  onRemoveTag?: (tag: string) => void;
}

export function FileTags({ tags, onRemoveTag }: FileTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'drawing':
      case 'drawings':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rendering':
      case 'renderings':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'blueprint':
      case 'blueprints':
      case 'floor plan':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'material':
      case 'materials':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'finish':
      case 'finishes':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fixture':
      case 'fixtures':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className={`h-6 py-0 flex items-center ${getTagColor(tag)}`}
        >
          {tag}
          {onRemoveTag && (
            <button
              type="button"
              className="ml-1 text-gray-400 hover:text-gray-600"
              onClick={() => onRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
}
