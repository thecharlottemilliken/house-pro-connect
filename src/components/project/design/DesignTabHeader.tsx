
import React from 'react';
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

interface DesignTabHeaderProps {
  area: string;
  location?: string;
}

const DesignTabHeader = ({ area, location }: DesignTabHeaderProps) => {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{area}</h2>
        {location && (
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{location}</p>
        )}
      </div>
      <Button variant="outline" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2">
        <PenLine className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="text-xs sm:text-sm">Edit</span>
      </Button>
    </div>
  );
};

export default DesignTabHeader;
