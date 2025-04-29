
import React, { useState } from "react";
import { FileWithPreview, RoomTagOption } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileTagsProps {
  file: FileWithPreview;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  roomOptions?: RoomTagOption[];
}

export function FileTags({ file, onAddTag, onRemoveTag, roomOptions = [] }: FileTagsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");

  const handleAddTag = () => {
    if (selectedTag) {
      onAddTag(selectedTag);
      setSelectedTag("");
      setIsAdding(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2 items-center">
        {file.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => onRemoveTag(tag)}
            />
          </Badge>
        ))}

        {!isAdding ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Tag
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                {roomOptions.length > 0 ? (
                  roomOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="livingRoom">Living Room</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bathroom">Bathroom</SelectItem>
                    <SelectItem value="bedroom">Bedroom</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="blueprint">Blueprint</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAddTag}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
