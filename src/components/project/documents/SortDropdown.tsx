
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortDropdownProps {
  variant?: "documents" | "materials";
}

const SortDropdown = ({ variant = "documents" }: SortDropdownProps) => {
  return (
    <Select defaultValue="recommended">
      <SelectTrigger className="w-full sm:w-48 border-gray-300">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recommended">Recommended</SelectItem>
        {variant === "documents" ? (
          <>
            <SelectItem value="date-new">Date (newest first)</SelectItem>
            <SelectItem value="date-old">Date (oldest first)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </>
        ) : (
          <>
            <SelectItem value="date-asc">Date (earliest first)</SelectItem>
            <SelectItem value="date-desc">Date (latest first)</SelectItem>
            <SelectItem value="price-asc">Price (low to high)</SelectItem>
            <SelectItem value="price-desc">Price (high to low)</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default SortDropdown;
