
import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileTagsProps {
  tags: string[];
  onRemoveTag?: (tag: string) => void;
  maxDisplay?: number;
}

export function FileTags({ tags, onRemoveTag, maxDisplay = 5 }: FileTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  const getTagColor = (tag: string) => {
    const tagLower = tag.toLowerCase();
    
    // Room-based tags
    if (tagLower.includes('kitchen')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (tagLower.includes('bathroom')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (tagLower.includes('bedroom')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (tagLower.includes('living')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (tagLower.includes('dining')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (tagLower.includes('office')) return 'bg-violet-50 text-violet-700 border-violet-200';
    if (tagLower.includes('exterior')) return 'bg-green-50 text-green-700 border-green-200';
    
    // Content type tags
    switch (tagLower) {
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
      case '3d model':
      case 'model':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'concept':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'layout':
        return 'bg-lime-50 text-lime-700 border-lime-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Display a limited number of tags with a "+X more" indicator if needed
  const displayTags = maxDisplay > 0 && tags.length > maxDisplay 
    ? tags.slice(0, maxDisplay) 
    : tags;
    
  const extraTagsCount = maxDisplay > 0 ? Math.max(0, tags.length - maxDisplay) : 0;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map((tag) => (
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
      
      {extraTagsCount > 0 && (
        <Badge
          variant="outline"
          className="h-6 py-0 flex items-center bg-gray-100 text-gray-600 border-gray-300"
        >
          +{extraTagsCount} more
        </Badge>
      )}
    </div>
  );
}
