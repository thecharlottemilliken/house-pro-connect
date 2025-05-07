
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, X, Check, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface RoomMeasurementsCardProps {
  area: string;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  onSaveMeasurements: (measurements: any) => void;
  initialEditMode?: boolean;
}

const RoomMeasurementsCard = ({
  area,
  measurements,
  onSaveMeasurements,
  initialEditMode = false
}: RoomMeasurementsCardProps) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [length, setLength] = useState<string>(measurements?.length?.toString() || "");
  const [width, setWidth] = useState<string>(measurements?.width?.toString() || "");
  const [height, setHeight] = useState<string>(measurements?.height?.toString() || "");
  const [unit, setUnit] = useState<'ft' | 'm'>(measurements?.unit || 'ft');
  const [notes, setNotes] = useState<string>(measurements?.additionalNotes || "");

  // Update local state when measurements prop changes
  useEffect(() => {
    setLength(measurements?.length?.toString() || "");
    setWidth(measurements?.width?.toString() || "");
    setHeight(measurements?.height?.toString() || "");
    setUnit(measurements?.unit || 'ft');
    setNotes(measurements?.additionalNotes || "");
  }, [measurements]);

  const handleSave = () => {
    const newMeasurements = {
      length: length ? parseFloat(length) : undefined,
      width: width ? parseFloat(width) : undefined,
      height: height ? parseFloat(height) : undefined,
      unit,
      additionalNotes: notes
    };
    onSaveMeasurements(newMeasurements);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLength(measurements?.length?.toString() || "");
    setWidth(measurements?.width?.toString() || "");
    setHeight(measurements?.height?.toString() || "");
    setUnit(measurements?.unit || 'ft');
    setNotes(measurements?.additionalNotes || "");
    setIsEditing(false);
  };

  const formatMeasurements = () => {
    const parts = [];
    if (measurements?.length) parts.push(`${measurements.length} ${measurements.unit}`);
    if (measurements?.width) parts.push(`${measurements.width} ${measurements.unit}`);
    if (measurements?.height) parts.push(`${measurements.height} ${measurements.unit}`);
    
    if (parts.length === 0) return "No measurements added";
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} × ${parts[1]}`;
    return `${parts[0]} × ${parts[1]} × ${parts[2]}`;
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-0">
        <div className="bg-[#174c65] text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xl">Room Measurements</h3>
              <p className="text-white/80 mt-1">Add measurements for your {area}</p>
            </div>
            {!isEditing && (
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white text-[#174c65] hover:bg-gray-100"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {!isEditing ? (
            <div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Dimensions</p>
                  <p className="text-base font-medium text-gray-900 mt-1">{formatMeasurements()}</p>
                </div>
                {measurements?.additionalNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                    <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{measurements.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-medium">Room Dimensions</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label htmlFor="length" className="text-sm text-gray-500">Length</label>
                  <Input
                    id="length"
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="Length"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="width" className="text-sm text-gray-500">Width</label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="Width"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="height" className="text-sm text-gray-500">Height</label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Height"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-sm text-gray-500">Unit</label>
                  <div className="flex mt-1">
                    <Button
                      type="button"
                      variant={unit === 'ft' ? "default" : "outline"}
                      className={`flex-1 ${unit === 'ft' ? 'bg-[#174c65]' : ''}`}
                      onClick={() => setUnit('ft')}
                    >
                      ft
                    </Button>
                    <Button
                      type="button"
                      variant={unit === 'm' ? "default" : "outline"}
                      className={`flex-1 ${unit === 'm' ? 'bg-[#174c65]' : ''}`}
                      onClick={() => setUnit('m')}
                    >
                      m
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm text-gray-500">Additional Notes</label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details about the room measurements..."
                  className="h-32"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[#174c65] hover:bg-[#174c65]/90 flex items-center gap-1"
                >
                  <Save className="h-4 w-4" /> Save Measurements
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomMeasurementsCard;
