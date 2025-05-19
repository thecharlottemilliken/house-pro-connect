
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
      const area = measurements.length * measurements.width;
      return `${area.toFixed(1)} ${measurements.unit === 'ft' ? 'SQFT' : 'm²'}`;
    }
    return ""; // Return blank when no measurements
  };

  // Format dimensions based on the available data
  const formatDimensions = (): string => {
    if (!measurements) return "";
    
    const { length, width, height, unit } = measurements;
    const parts = [];
    
    if (length) parts.push(`${length}`);
    if (width) parts.push(`${width}`);
    if (height) parts.push(`${height}`);
    
    if (parts.length === 0) return "";
    return `${parts.join(' × ')} ${unit}`;
  };

  const dimensions = formatDimensions();
  const squareFootage = calculateSquareFootage();

  return (
    <div className="space-y-4 mb-8">
      {squareFootage && (
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-base font-medium">Square Feet:</span>
          <div className="flex items-center">
            <SquareDot className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">
              <span className="text-gray-500">est</span> {squareFootage}
            </span>
          </div>
        </div>
      )}

      {dimensions && (
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-base font-medium">Dimensions:</span>
          <div className="flex items-center">
            <Ruler className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">{dimensions}</span>
          </div>
        </div>
      )}

      {!dimensions && (
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-base font-medium">Dimensions:</span>
          <div className="flex items-center">
            <Ruler className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm text-gray-400">Not available</span>
          </div>
        </div>
      )}

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
