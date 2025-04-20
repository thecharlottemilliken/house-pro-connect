import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Square, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleAddWorkArea = () => {
    if (!currentArea.name.trim()) {
      toast({
        title: "Work Area Name Required",
        description: "Please provide a name for the work area before adding it.",
        variant: "destructive",
      });
      return;
    }
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
    toast({
      title: "Work Area Added",
      description: "The work area has been added successfully.",
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
    const finalAreas = currentArea.name.trim() 
      ? [...workAreas, currentArea]
      : workAreas;
    
    if (finalAreas.length === 0) {
      toast({
        title: "No Work Areas",
        description: "Please add at least one work area before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    onSave(finalAreas);
    toast({
      title: "Work Areas Saved",
      description: `Successfully saved ${finalAreas.length} work area(s).`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Square className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Define Work Area</h3>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="work-area-name">Work Area Name*</Label>
                <Input
                  id="work-area-name"
                  placeholder="e.g., Kitchen, Master Bathroom, Living Room"
                  value={currentArea.name}
                  onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="work-area-notes">Description & Scope</Label>
                <Textarea
                  id="work-area-notes"
                  placeholder="Describe the work to be done in this area..."
                  value={currentArea.notes}
                  onChange={(e) => setCurrentArea({ ...currentArea, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Room Measurements</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-sqft">Total SQFT</Label>
                <Input
                  id="total-sqft"
                  type="number"
                  placeholder="0"
                  value={currentArea.measurements.totalSqft}
                  onChange={(e) => setCurrentArea({
                    ...currentArea,
                    measurements: { ...currentArea.measurements, totalSqft: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length (inches)</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="0"
                  value={currentArea.measurements.length}
                  onChange={(e) => setCurrentArea({
                    ...currentArea,
                    measurements: { ...currentArea.measurements, length: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (inches)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="0"
                  value={currentArea.measurements.width}
                  onChange={(e) => setCurrentArea({
                    ...currentArea,
                    measurements: { ...currentArea.measurements, width: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="0"
                  value={currentArea.measurements.height}
                  onChange={(e) => setCurrentArea({
                    ...currentArea,
                    measurements: { ...currentArea.measurements, height: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="affects-other-areas"
                checked={currentArea.affectsOtherAreas}
                onCheckedChange={(checked) => 
                  setCurrentArea({ ...currentArea, affectsOtherAreas: checked as boolean })
                }
              />
              <Label htmlFor="affects-other-areas">This work will affect other areas of the property</Label>
            </div>

            {currentArea.affectsOtherAreas && (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">List any other areas that will be impacted by this work</p>
                {currentArea.additionalAreas.map((area, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Affected Area Name</Label>
                        <Input
                          placeholder="e.g., Hallway, Adjacent Room"
                          value={area.name}
                          onChange={(e) => {
                            const updatedAreas = [...currentArea.additionalAreas];
                            updatedAreas[index].name = e.target.value;
                            setCurrentArea({ ...currentArea, additionalAreas: updatedAreas });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Impact Description</Label>
                        <Textarea
                          placeholder="Describe how this area will be affected..."
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
                  className="w-full mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Affected Area
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={handleAddWorkArea}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Work Area
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            className="flex-1"
            variant="default"
          >
            Save & Continue
          </Button>
        </div>
      </div>

      {workAreas.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-lg">Added Work Areas</h4>
          <div className="grid gap-4">
            {workAreas.map((area, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-base">{area.name}</h5>
                  {area.notes && (
                    <p className="text-sm text-muted-foreground">{area.notes}</p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Dimensions:</span> {area.measurements.length}"x{area.measurements.width}"x{area.measurements.height}"
                  </div>
                  {area.affectsOtherAreas && area.additionalAreas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Affected Areas:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {area.additionalAreas.map((affected, i) => (
                          <li key={i}>{affected.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
