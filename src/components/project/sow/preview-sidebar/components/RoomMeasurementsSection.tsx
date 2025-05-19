
import React from 'react';

interface RoomMeasurementsProps {
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  selectedRoom: string;
}

export function RoomMeasurementsSection({ measurements, selectedRoom }: RoomMeasurementsProps) {
  if (!measurements || selectedRoom === 'all') {
    return null;
  }

  const { length, width, height, unit, additionalNotes } = measurements;

  // Calculate square footage when both length and width are available
  const calculateArea = () => {
    if (length && width) {
      return `${(length * width).toFixed(1)} sq ${unit}`;
    }
    return null;
  };

  const squareFootage = calculateArea();

  // Function to render measurement with unit
  const formatMeasurement = (value?: number) => {
    if (value === undefined) return 'N/A';
    return `${value} ${unit}`;
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100">
      <h3 className="text-sm font-medium mb-2">Room Measurements</h3>
      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
        <div className="bg-gray-50 p-2 rounded">
          <span className="text-gray-500 block">Length</span>
          <span className="font-medium">{formatMeasurement(length)}</span>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <span className="text-gray-500 block">Width</span>
          <span className="font-medium">{formatMeasurement(width)}</span>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <span className="text-gray-500 block">Height</span>
          <span className="font-medium">{formatMeasurement(height)}</span>
        </div>
      </div>
      
      {squareFootage && (
        <div className="bg-gray-50 p-2 rounded text-xs mb-2">
          <span className="text-gray-500 block">Area</span>
          <span className="font-medium">{squareFootage}</span>
        </div>
      )}
      
      {additionalNotes && (
        <div className="text-xs">
          <span className="text-gray-500 font-medium">Notes: </span>
          <span>{additionalNotes}</span>
        </div>
      )}
    </div>
  );
}
