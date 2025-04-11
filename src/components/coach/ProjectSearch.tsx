
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProjectSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ProjectSearch = ({ searchQuery, setSearchQuery }: ProjectSearchProps) => {
  return (
    <div className="relative w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input 
        placeholder="Search projects..."
        className="pl-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default ProjectSearch;
