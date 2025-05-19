
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
  // Improved debugging for incoming measurements data
  console.log("RoomPropertyInfo - Raw measurements data:", JSON.stringify(measurements, null, 2));
  
  // Calculate square footage based on measurements - improved null/undefined handling
  const calculateSquareFootage = (): string => {
    if (measurements && 
        typeof measurements.length === 'number' && 
        typeof measurements.width === 'number' && 
        measurements.length > 0 && 
        measurements.width > 0) {
      const area = measurements.length * measurements.width;
      return `${area.toFixed(1)} ${measurements.unit === 'ft' ? 'SQFT' : 'm²'}`;
    }
    return ""; // Return blank when no valid measurements
  };

  // Format dimensions based on the available data - improved null/undefined handling
  const formatDimensions = (): string => {
    if (!measurements) return "";
    
    // Ensure unit exists, default to ft if not provided
    const { length, width, height, unit = 'ft' } = measurements;
    const parts = [];
    
    // Only add dimensions that are numbers greater than 0
    if (typeof length === 'number' && length > 0) parts.push(`${length}`);
    if (typeof width === 'number' && width > 0) parts.push(`${width}`);
    if (typeof height === 'number' && height > 0) parts.push(`${height}`);
    
    if (parts.length === 0) return "";
    return `${parts.join(' × ')} ${unit}`;
  };

  const dimensions = formatDimensions();
  const squareFootage = calculateSquareFootage();

  // More detailed logging to debug measurements display issues
  console.log("RoomPropertyInfo - dimensions string:", dimensions);
  console.log("RoomPropertyInfo - squareFootage string:", squareFootage);
  console.log("RoomPropertyInfo - Measurement types:", {
    length: measurements?.length ? typeof measurements.length : 'undefined',
    width: measurements?.width ? typeof measurements.width : 'undefined',
    height: measurements?.height ? typeof measurements.height : 'undefined',
  });

  // Check if we have valid measurements by checking if length, width or height are numbers
  const hasMeasurements = Boolean(
    measurements && (
      (typeof measurements.length === 'number' && measurements.length > 0) || 
      (typeof measurements.width === 'number' && measurements.width > 0) || 
      (typeof measurements.height === 'number' && measurements.height > 0) ||
      measurements.additionalNotes
    )
  );

  console.log("RoomPropertyInfo - hasMeasurements:", hasMeasurements);

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

      {dimensions ? (
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-base font-medium">Dimensions:</span>
          <div className="flex items-center">
            <Ruler className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm">{dimensions}</span>
          </div>
        </div>
      ) : (
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
