import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { WorkAreaTable } from "./WorkAreaTable";

interface WorkArea {
  name: string;
  notes: string;
  measurements: {
    width: string;
    height: string;
    length: string;
    totalSqft: string;
  };
  additionalAreas: Array<{
    name: string;
    notes: string;
  }>;
  affectsOtherAreas: boolean;
}

interface WorkAreaFormProps {
  onSave: (areas: WorkArea[]) => void;
  initialData?: WorkArea[];
}

export function WorkAreaForm({ onSave, initialData = [] }: WorkAreaFormProps) {
  const [workAreas, setWorkAreas] = useState<WorkArea[]>(initialData || []);
  const [currentArea, setCurrentArea] = useState<WorkArea>({
    name: "",
    notes: "",
    measurements: {
      width: "",
      height: "",
      length: "",
      totalSqft: "",
    },
    additionalAreas: [],
    affectsOtherAreas: false,
  });
  const [currentAdditionalArea, setCurrentAdditionalArea] = useState({
    name: "",
    notes: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setWorkAreas(initialData);
    }
  }, [initialData]);

  const handleAddWorkArea = () => {
    if (!currentArea.name.trim()) return;

    if (editMode && editIndex !== null) {
      const updatedAreas = [...workAreas];
      updatedAreas[editIndex] = currentArea;
      setWorkAreas(updatedAreas);
      setEditMode(false);
      setEditIndex(null);
    } else {
      setWorkAreas([...workAreas, currentArea]);
    }

    setCurrentArea({
      name: "",
      notes: "",
      measurements: {
        width: "",
        height: "",
        length: "",
        totalSqft: "",
      },
      additionalAreas: [],
      affectsOtherAreas: false,
    });
  };

  const handleAddAdditionalArea = () => {
    if (!currentAdditionalArea.name.trim()) return;

    const updatedArea = {
      ...currentArea,
      additionalAreas: [
        ...currentArea.additionalAreas,
        currentAdditionalArea,
      ],
    };

    setCurrentArea(updatedArea);
    setCurrentAdditionalArea({ name: "", notes: "" });
  };

  const handleRemoveAdditionalArea = (index: number) => {
    const updatedAdditionalAreas = currentArea.additionalAreas.filter(
      (_, i) => i !== index
    );
    setCurrentArea({ ...currentArea, additionalAreas: updatedAdditionalAreas });
  };

  const handleEditArea = (area: WorkArea, index: number) => {
    setCurrentArea(area);
    setEditMode(true);
    setEditIndex(index);
  };

  const handleDeleteArea = (index: number) => {
    const updatedAreas = workAreas.filter((_, i) => i !== index);
    setWorkAreas(updatedAreas);
  };

  const handleDuplicateArea = (area: WorkArea) => {
    setWorkAreas([...workAreas, {...area, name: `${area.name} (Copy)`}]);
  };

  const handleSaveAreas = () => {
    onSave(workAreas);
  };

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? "Edit Work Area" : "Add Work Area"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="areaName">Area Name</Label>
                <Input
                  id="areaName"
                  value={currentArea.name}
                  onChange={(e) =>
                    setCurrentArea({ ...currentArea, name: e.target.value })
                  }
                  placeholder="e.g., Kitchen, Master Bathroom"
                />
              </div>
              <div>
                <Label htmlFor="areaNotes">Notes</Label>
                <Textarea
                  id="areaNotes"
                  value={currentArea.notes}
                  onChange={(e) =>
                    setCurrentArea({ ...currentArea, notes: e.target.value })
                  }
                  placeholder="Additional details about the work area..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="totalSqft">Total Square Footage</Label>
                  <Input
                    id="totalSqft"
                    value={currentArea.measurements.totalSqft}
                    onChange={(e) =>
                      setCurrentArea({
                        ...currentArea,
                        measurements: {
                          ...currentArea.measurements,
                          totalSqft: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., 120"
                  />
                </div>
              </div>
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="affectsOtherAreas"
                  checked={currentArea.affectsOtherAreas}
                  onCheckedChange={(checked) =>
                    setCurrentArea({
                      ...currentArea,
                      affectsOtherAreas: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="affectsOtherAreas"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  This work area affects other areas of the property
                </Label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Additional Affected Areas</h3>
            <div className="space-y-3 mb-4">
              <div>
                <Label htmlFor="additionalAreaName">Area Name</Label>
                <Input
                  id="additionalAreaName"
                  value={currentAdditionalArea.name}
                  onChange={(e) =>
                    setCurrentAdditionalArea({
                      ...currentAdditionalArea,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Hallway, Living Room"
                />
              </div>
              <div>
                <Label htmlFor="additionalAreaNotes">Notes</Label>
                <Input
                  id="additionalAreaNotes"
                  value={currentAdditionalArea.notes}
                  onChange={(e) =>
                    setCurrentAdditionalArea({
                      ...currentAdditionalArea,
                      notes: e.target.value,
                    })
                  }
                  placeholder="How this area is affected..."
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAdditionalArea}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Affected Area
              </Button>
            </div>

            {currentArea.additionalAreas.length > 0 && (
              <div className="border rounded-md p-3 bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Added Areas:</h4>
                <ul className="space-y-2">
                  {currentArea.additionalAreas.map((area, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <span className="font-medium">{area.name}</span>
                        {area.notes && (
                          <span className="text-gray-500 ml-2">
                            - {area.notes}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdditionalArea(index)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button type="button" onClick={handleAddWorkArea}>
            {editMode ? "Update Area" : "Add Area"}
          </Button>
        </div>
      </div>

      {workAreas.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Work Areas</h2>
            <WorkAreaTable
              workAreas={workAreas}
              onEdit={handleEditArea}
              onDuplicate={handleDuplicateArea}
              onDelete={handleDeleteArea}
            />
            <div className="flex justify-end mt-6">
              <Button type="button" onClick={handleSaveAreas}>
                Save Work Areas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
