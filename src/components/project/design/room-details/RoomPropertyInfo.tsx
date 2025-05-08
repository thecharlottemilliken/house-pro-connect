
import React from 'react';
import { MapPin, Ruler, SquareDot } from "lucide-react";

interface RoomPropertyInfoProps {
  area: string;
  location?: string;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
}

const RoomPropertyInfo: React.FC<RoomPropertyInfoProps> = ({ area, location, measurements }) => {
  // Calculate square footage based on measurements
  const calculateSquareFootage = (): string => {
    if (measurements?.length && measurements?.width) {
      return `${measurements.length * measurements.width} SQFT`;
    }
    return ""; // Return blank when no measurements
  };

  // Format measurements based on the available data
  const formatMeasurements = (): string => {
    if (measurements?.length && measurements?.width && measurements?.height) {
      return `${measurements.length}x${measurements.width}x${measurements.height}"`;
    }
    return ""; // Return blank when no measurements
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3 text-gray-700">
        <span className="text-base font-medium">Square Feet:</span>
        <div className="flex items-center">
          <SquareDot className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm">
            {calculateSquareFootage() ? (
              <>
                <span className="text-gray-500">est</span> {calculateSquareFootage()}
              </>
            ) : (
              <span className="text-gray-400">Not available</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-gray-700">
        <span className="text-base font-medium">Measurements:</span>
        <div className="flex items-center">
          <Ruler className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm">
            {formatMeasurements() || <span className="text-gray-400">Not available</span>}
          </span>
        </div>
      </div>

      {location && (
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-base font-medium">Location:</span>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">{location}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPropertyInfo;
