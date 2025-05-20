
import React from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoomTagOption } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FileTagsProps {
  tags: string[];
  options?: RoomTagOption[];
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  maxDisplay?: number; // Add the maxDisplay property
}

export const FileTags = ({
  tags,
  options = [],
  onAddTag,
  onRemoveTag,
  maxDisplay, // Include in destructuring
}: FileTagsProps) => {
  // If maxDisplay is provided and there are more tags than the limit, only show limited tags
  const displayedTags = maxDisplay && tags.length > maxDisplay 
    ? tags.slice(0, maxDisplay) 
    : tags;
  
  // Calculate if there are additional tags that aren't being displayed
  const additionalTagsCount = maxDisplay && tags.length > maxDisplay 
    ? tags.length - maxDisplay 
    : 0;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {displayedTags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="text-xs py-0 h-5"
        >
          {tag}
          {onRemoveTag && (
            <button
              type="button"
              className="ml-1 hover:text-destructive focus:outline-none"
              onClick={() => onRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      
      {/* Show badge with count if there are additional hidden tags */}
      {additionalTagsCount > 0 && (
        <Badge
          variant="outline"
          className="text-xs py-0 h-5"
        >
          +{additionalTagsCount} more
        </Badge>
      )}
      
      {onAddTag && options.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            <div className="space-y-1">
              {options.map((option) => {
                const isSelected = tags.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    disabled={isSelected}
                    onClick={() => !isSelected && onAddTag(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
