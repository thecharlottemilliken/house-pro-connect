
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AffectedArea {
  name: string;
  notes: string;
}

interface AffectedAreasSectionProps {
  affectsOtherAreas: boolean;
  additionalAreas: AffectedArea[];
  onAffectsOtherAreasChange: (checked: boolean) => void;
  onAdditionalAreasChange: (areas: AffectedArea[]) => void;
  onAddAdditionalArea: () => void;
}

export function AffectedAreasSection({ 
  affectsOtherAreas, 
  additionalAreas, 
  onAffectsOtherAreasChange,
  onAdditionalAreasChange,
  onAddAdditionalArea
}: AffectedAreasSectionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="affects-other-areas"
            checked={affectsOtherAreas}
            onCheckedChange={(checked) => 
              onAffectsOtherAreasChange(checked as boolean)
            }
          />
          <Label htmlFor="affects-other-areas">This work will affect other areas of the property</Label>
        </div>

        {affectsOtherAreas && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">List any other areas that will be impacted by this work</p>
            {additionalAreas.map((area, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Affected Area Name</Label>
                    <Input
                      placeholder="e.g., Hallway, Adjacent Room"
                      value={area.name}
                      onChange={(e) => {
                        const updatedAreas = [...additionalAreas];
                        updatedAreas[index].name = e.target.value;
                        onAdditionalAreasChange(updatedAreas);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Impact Description</Label>
                    <Textarea
                      placeholder="Describe how this area will be affected..."
                      value={area.notes}
                      onChange={(e) => {
                        const updatedAreas = [...additionalAreas];
                        updatedAreas[index].notes = e.target.value;
                        onAdditionalAreasChange(updatedAreas);
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={onAddAdditionalArea}
              className="w-full mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Affected Area
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
