
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

interface TagFilterProps {
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ selectedTag, onSelectTag }) => {
  return (
    <Select 
      value={selectedTag || undefined} 
      onValueChange={(value) => onSelectTag(value)}
    >
      <SelectTrigger className="w-full md:w-48 border-gray-300">
        <SelectValue placeholder="Select a tag">
          {selectedTag ? `Tag: ${selectedTag}` : "Tag"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Insurance">Insurance</SelectItem>
        <SelectItem value="Contract">Contract</SelectItem>
        <SelectItem value="Blueprint">Blueprint</SelectItem>
        <SelectItem value="Financial">Financial</SelectItem>
        <SelectItem value="Permit">Permit</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TagFilter;
