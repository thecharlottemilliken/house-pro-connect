
import React from 'react';
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";

interface MeasurementsBannerProps {
  area?: string;
  onMeasureRoom?: () => void;
}

const MeasurementsBanner = ({
  area,
  onMeasureRoom
}: MeasurementsBannerProps) => {
  return (
    <div className="w-full bg-[#174c65] text-white rounded-lg overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="space-y-2 mb-4 md:mb-0">
          <h2 className="text-3xl font-bold">Add your room measurements.</h2>
          <p className="text-white/90 text-lg">
            Not sure how to get accurate measurements? No worries, we will walk 
            you through it step-by-step.
          </p>
        </div>
        <Button
          onClick={onMeasureRoom}
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold py-2 px-4 rounded-md whitespace-nowrap"
          size="lg"
        >
          MEASURE ROOM
        </Button>
      </div>
    </div>
  );
};

export default MeasurementsBanner;
