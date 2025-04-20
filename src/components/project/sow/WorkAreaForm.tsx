
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface WorkArea {
  name: string;
  notes: string;
  measurements: {
    length: string;
    width: string;
    height: string;
    totalSqft: string;
  };
  affectsOtherAreas: boolean;
  additionalAreas: Array<{
    name: string;
    notes: string;
  }>;
}

interface WorkAreaFormProps {
  onSave: (areas: WorkArea[]) => void;
}

export function WorkAreaForm({ onSave }: WorkAreaFormProps) {
  const [workAreas, setWorkAreas] = useState<WorkArea[]>([]);
  const [currentArea, setCurrentArea] = useState<WorkArea>({
    name: '',
    notes: '',
    measurements: {
      length: '',
      width: '',
      height: '',
      totalSqft: ''
    },
    affectsOtherAreas: false,
    additionalAreas: []
  });

  const handleAddWorkArea = () => {
    if (!currentArea.name.trim()) return;
    setWorkAreas([...workAreas, currentArea]);
    setCurrentArea({
      name: '',
      notes: '',
      measurements: {
        length: '',
        width: '',
        height: '',
        totalSqft: ''
      },
      affectsOtherAreas: false,
      additionalAreas: []
    });
  };

  const handleAddAdditionalArea = () => {
    setCurrentArea({
      ...currentArea,
      additionalAreas: [
        ...currentArea.additionalAreas,
        { name: '', notes: '' }
      ]
    });
  };

  const handleSave = () => {
    if (currentArea.name.trim()) {
      const finalAreas = [...workAreas, currentArea];
      onSave(finalAreas);
    } else {
      onSave(workAreas);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Work Area</Label>
            <Input
              placeholder="Enter work area name"
              value={currentArea.name}
              onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add any notes about this work area"
              value={currentArea.notes}
              onChange={(e) => setCurrentArea({ ...currentArea, notes: e.target.value })}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium">Add Room Measurements</h4>
            <p className="text-sm text-gray-500">Measurement in inches.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Total SQFT</Label>
                <Input
                  type="number"
                  placeholder="SQFT"
                  value={currentArea.measurements.totalSqft}
                  onChange={(e) => setCurrentArea({
                    ...currentArea,
                    measurements: { ...currentArea.measurements, totalSqft: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Length (In)</Label>
                <Input
                  type="number"
                  placeholder="Length"
                  value={currentArea.measurements.length}
                  onChange={(e) => setCurrentArea({
                    ...currentArea,
                    measurements: { ...currentArea.measurements, length: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Width (In)</Label>
                <Input
                  type="number"
                  placeholder="Width"
                  value={currentArea.measurements.width}
                  onChange={(e) => setCurrentArea({
                    ...currentArea,
                    measurements: { ...currentArea.measurements, width: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Height (In)</Label>
                <Input
                  type="number"
                  placeholder="Height"
                  value={currentArea.measurements.height}
                  onChange={(e) => setCurrentArea({
                    ...currentArea,
                    measurements: { ...currentArea.measurements, height: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="affects-other-areas"
              checked={currentArea.affectsOtherAreas}
              onCheckedChange={(checked) => 
                setCurrentArea({ ...currentArea, affectsOtherAreas: checked as boolean })
              }
            />
            <Label htmlFor="affects-other-areas">Other work areas will be affected by this work</Label>
          </div>
        </div>

        {currentArea.affectsOtherAreas && (
          <div className="space-y-4">
            <h4 className="font-medium">Additional Work Areas</h4>
            {currentArea.additionalAreas.map((area, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label>Work Area</Label>
                    <Input
                      placeholder="Enter work area name"
                      value={area.name}
                      onChange={(e) => {
                        const updatedAreas = [...currentArea.additionalAreas];
                        updatedAreas[index].name = e.target.value;
                        setCurrentArea({ ...currentArea, additionalAreas: updatedAreas });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Add any notes"
                      value={area.notes}
                      onChange={(e) => {
                        const updatedAreas = [...currentArea.additionalAreas];
                        updatedAreas[index].notes = e.target.value;
                        setCurrentArea({ ...currentArea, additionalAreas: updatedAreas });
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAdditionalArea}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Area
            </Button>
          </div>
        )}

        <Button
          type="button"
          onClick={handleAddWorkArea}
          className="w-full"
        >
          Add Work Area
        </Button>
      </div>

      {workAreas.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Added Work Areas</h4>
          {workAreas.map((area, index) => (
            <Card key={index} className="p-4">
              <h5 className="font-medium">{area.name}</h5>
              {area.notes && <p className="text-sm text-gray-500 mt-1">{area.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      <Button
        type="button"
        onClick={handleSave}
        className="w-full"
      >
        Save Work Areas
      </Button>
    </div>
  );
}
