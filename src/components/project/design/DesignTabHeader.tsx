
import React from 'react';
import { Button } from "@/components/ui/button";

interface DesignTabHeaderProps {
  area: string;
  location?: string;
}

const DesignTabHeader = ({ area, location }: DesignTabHeaderProps) => {
  return (
    <div className="flex justify-between items-center pb-6">
      <h2 className="text-4xl font-bold text-black">{area}</h2>
      <Button variant="link" className="text-lg font-semibold text-black hover:underline p-0 h-auto">
        Edit
      </Button>
    </div>
  );
};

export default DesignTabHeader;
