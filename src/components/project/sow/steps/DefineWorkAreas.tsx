// Import necessary modules
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { useSOW, WorkArea } from "../SOWContext";
import { v4 as uuidv4 } from "uuid";
import { ProjectData, PropertyDetails, RenovationArea } from "@/hooks/useProjectData";

// Define component props
interface DefineWorkAreasProps {
  projectData: ProjectData | null;
  propertyDetails: PropertyDetails;
}

interface WorkAreaWithCustomName extends WorkArea {
  customName?: string;
}

const DefineWorkAreas: React.FC<DefineWorkAreasProps> = ({ projectData, propertyDetails }) => {
  const { sowData, addWorkArea, updateWorkArea, removeWorkArea } = useSOW();
  const [newWorkArea, setNewWorkArea] = useState<Partial<WorkAreaWithCustomName>>({
    name: "",
    type: "primary",
    notes: "",
  });

  // Generate default work areas based on renovation areas if available
  const defaultWorkAreas = projectData?.renovation_areas 
    ? projectData.renovation_areas.map((area: RenovationArea) => ({
        id: uuidv4(),
        name: area.area,
        type: "primary" as const,
        notes: ""
      }))
    : [];

  // Add a work area
  const handleAddWorkArea = () => {
    if (!newWorkArea.customName) return;

    const workArea: WorkArea = {
      id: uuidv4(),
      name: newWorkArea.customName, // Use customName for the name
      type: newWorkArea.type as "primary" | "secondary",
      notes: newWorkArea.notes || ""
    };

    addWorkArea(workArea);
    
    // Reset form
    setNewWorkArea({
      name: "",
      type: "primary",
      notes: "",
      customName: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h2 className="text-xl font-bold">Define Work Areas</h2>
        <p className="text-gray-600">
          Specify the primary work areas where renovation will take place, and secondary areas that may be affected during the project.
        </p>
      </div>

      {/* Current work areas */}
      {sowData.workAreas.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Current Work Areas</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {sowData.workAreas.map((area) => (
              <Card key={area.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{area.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {area.type === "primary" ? "Primary Area" : "Secondary Area"}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeWorkArea(area.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {area.notes && <p className="text-sm text-gray-600 mt-2">{area.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add new work area */}
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-4">Add Work Area</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="areaName">Area Name</Label>
              <Input 
                id="customName"
                placeholder="Enter area name"
                value={newWorkArea.customName || ""}
                onChange={(e) => setNewWorkArea(prev => ({ ...prev, customName: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Area Type</Label>
              <RadioGroup 
                defaultValue={newWorkArea.type}
                value={newWorkArea.type}
                onValueChange={(value) => setNewWorkArea(prev => ({ ...prev, type: value as "primary" | "secondary" }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="primary" id="primary" />
                  <Label htmlFor="primary">Primary Work Area</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="secondary" id="secondary" />
                  <Label htmlFor="secondary">Secondary Affected Area</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Add any specific details about this work area"
              value={newWorkArea.notes}
              onChange={(e) => setNewWorkArea(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          
          <Button 
            onClick={handleAddWorkArea}
            disabled={!newWorkArea.customName}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Work Area
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DefineWorkAreas;
