
import React from 'react';
import { Button } from "@/components/ui/button";

interface DesignTabHeaderProps {
  area: string;
  location?: string;
}

const DesignTabHeader = ({ area, location }: DesignTabHeaderProps) => {
  return (
    <div className="flex justify-between items-center pb-4">
      <h2 className="text-2xl font-bold text-black">{area}</h2>
      <Button variant="ghost" className="text-sm font-medium text-gray-600 hover:text-black p-1 h-auto">
        Edit
      </Button>
    </div>
  );
};

export default DesignTabHeader;
