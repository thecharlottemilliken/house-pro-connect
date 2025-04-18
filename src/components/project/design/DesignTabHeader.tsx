
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
        <h2 className="text-xl font-bold text-gray-900">{area}</h2>
        {location && (
          <p className="text-sm text-gray-600 mt-1">{location}</p>
        )}
      </div>
      <Button variant="outline" size="sm" className="gap-2">
        <PenLine className="h-4 w-4" />
        Edit
      </Button>
    </div>
  );
};

export default DesignTabHeader;
