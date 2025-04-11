
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMemberFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const TeamMemberFilter = ({ value, onChange }: TeamMemberFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
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
