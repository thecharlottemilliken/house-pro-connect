
import React, { useState } from 'react';
import { Ruler, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isOpen, setIsOpen] = useState(true);
  
  // Debug the incoming measurements with more detail
  console.log(`RoomMeasurementsSection for ${selectedRoom}:`, measurements);
  
  // Skip rendering for 'all' rooms view or if no measurements
  if (!measurements || selectedRoom === 'all') {
    console.log(`RoomMeasurementsSection: No measurements or 'all' room selected`);
    return null;
  }

  // Ensure measurements has the expected structure with explicit number type checking
  const hasDimensions = 
    (typeof measurements.length === 'number' && measurements.length > 0) || 
    (typeof measurements.width === 'number' && measurements.width > 0) || 
    (typeof measurements.height === 'number' && measurements.height > 0);
  
  const hasNotes = Boolean(measurements.additionalNotes && measurements.additionalNotes.trim());
  
  // Only show section if we have dimensions or notes
  if (!hasDimensions && !hasNotes) {
    console.log(`RoomMeasurementsSection: No valid measurements for ${selectedRoom}`);
    return null;
  }

  // Guard against undefined measurements object
  const { length, width, height, unit = 'ft', additionalNotes } = measurements;

  // Calculate square footage when both length and width are available
  const calculateArea = () => {
    if (typeof length === 'number' && typeof width === 'number' && length > 0 && width > 0) {
      return `${(length * width).toFixed(1)} sq ${unit}`;
    }
    return null;
  };

  const squareFootage = calculateArea();

  // Function to render measurement with unit
  const formatMeasurement = (value?: number) => {
    if (typeof value !== 'number' || value <= 0) return 'N/A';
    return `${value} ${unit}`;
  };

  return (
    <div className="border-t border-b border-gray-100 bg-gray-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium">Room Measurements</h3>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-3">
          {hasDimensions && (
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                <span className="text-gray-500 block">Length</span>
                <span className="font-medium">{formatMeasurement(length)}</span>
              </div>
              <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                <span className="text-gray-500 block">Width</span>
                <span className="font-medium">{formatMeasurement(width)}</span>
              </div>
              <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                <span className="text-gray-500 block">Height</span>
                <span className="font-medium">{formatMeasurement(height)}</span>
              </div>
            </div>
          )}
          
          {squareFootage && (
            <div className="flex items-center gap-2 bg-white p-2 rounded text-xs mb-2 shadow-sm border border-gray-100">
              <Maximize2 className="h-3 w-3 text-gray-500" />
              <div>
                <span className="text-gray-500 block">Area</span>
                <span className="font-medium">{squareFootage}</span>
              </div>
            </div>
          )}
          
          {hasNotes && (
            <div className="bg-white p-2 rounded text-xs shadow-sm border border-gray-100">
              <span className="text-gray-500 font-medium block mb-1">Notes: </span>
              <span className="text-gray-700">{additionalNotes}</span>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
