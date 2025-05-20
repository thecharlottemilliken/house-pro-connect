
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoomMeasurement {
  length?: number;
  width?: number;
  height?: number;
  unit?: 'ft' | 'm';
  additionalNotes?: string;
}

interface MeasurementsCardProps {
  area: string;
  measurements?: RoomMeasurement;
  onEditMeasurements: () => void;
}

const MeasurementsCard: React.FC<MeasurementsCardProps> = ({ 
  area, 
  measurements,
  onEditMeasurements
}) => {
  if (!measurements) {
    return (
      <Card className="bg-white shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex justify-between items-center">
            <span>Room Measurements</span>
            <button 
              onClick={onEditMeasurements}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Add
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No measurements added yet</p>
        </CardContent>
      </Card>
    );
  }

  const { length, width, height, unit = 'ft', additionalNotes } = measurements;
  const unitDisplay = unit === 'ft' ? "'" : ' m';

  return (
    <Card className="bg-white shadow-sm border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex justify-between items-center">
          <span>Room Measurements</span>
          <button 
            onClick={onEditMeasurements}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {length !== undefined && (
            <div>
              <p className="text-gray-500 text-xs">Length</p>
              <p className="font-semibold">{length}{unitDisplay}</p>
            </div>
          )}
          {width !== undefined && (
            <div>
              <p className="text-gray-500 text-xs">Width</p>
              <p className="font-semibold">{width}{unitDisplay}</p>
            </div>
          )}
          {height !== undefined && (
            <div>
              <p className="text-gray-500 text-xs">Height</p>
              <p className="font-semibold">{height}{unitDisplay}</p>
            </div>
          )}
        </div>
        
        {additionalNotes && (
          <div className="mt-2">
            <p className="text-gray-500 text-xs">Notes</p>
            <p className="text-sm">{additionalNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeasurementsCard;
