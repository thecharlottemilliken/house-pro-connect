
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ruler } from "lucide-react";

interface WorkAreaMeasurementsProps {
  measurements: {
    length: string;
    width: string;
    height: string;
    totalSqft: string;
  };
  onChange: (measurements: {
    length: string;
    width: string;
    height: string;
    totalSqft: string;
  }) => void;
  sourceRoomId?: string;
}

export function WorkAreaMeasurements({ measurements, onChange, sourceRoomId }: WorkAreaMeasurementsProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Room Measurements</h3>
          {sourceRoomId && (
            <Badge variant="outline" className="ml-auto">
              Imported from room data
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total-sqft">Total SQFT</Label>
            <Input
              id="total-sqft"
              type="number"
              placeholder="0"
              value={measurements.totalSqft}
              onChange={(e) => onChange({
                ...measurements,
                totalSqft: e.target.value
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="length">Length (inches)</Label>
            <Input
              id="length"
              type="number"
              placeholder="0"
              value={measurements.length}
              onChange={(e) => onChange({
                ...measurements,
                length: e.target.value
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Width (inches)</Label>
            <Input
              id="width"
              type="number"
              placeholder="0"
              value={measurements.width}
              onChange={(e) => onChange({
                ...measurements,
                width: e.target.value
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (inches)</Label>
            <Input
              id="height"
              type="number"
              placeholder="0"
              value={measurements.height}
              onChange={(e) => onChange({
                ...measurements,
                height: e.target.value
              })}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
