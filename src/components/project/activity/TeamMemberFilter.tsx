
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMemberFilterProps {
  selectedMember: string | null;
  onSelectMember: (value: string | null) => void;
  value?: string;
  onChange?: (value: string) => void;
}

const TeamMemberFilter = ({ selectedMember, onSelectMember, value, onChange }: TeamMemberFilterProps) => {
  // Use either the new props or fall back to old props
  const currentValue = selectedMember ?? value ?? 'all';
  const handleValueChange = (newValue: string) => {
    if (onSelectMember) {
      onSelectMember(newValue === 'all' ? null : newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Team Member: All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Team Members</SelectItem>
        <SelectItem value="designer">Designers</SelectItem>
        <SelectItem value="plumber">Plumbers</SelectItem>
        <SelectItem value="electrician">Electricians</SelectItem>
        <SelectItem value="carpenter">Carpenters</SelectItem>
        <SelectItem value="landscaper">Landscapers</SelectItem>
        <SelectItem value="coach">Coaches</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TeamMemberFilter;
