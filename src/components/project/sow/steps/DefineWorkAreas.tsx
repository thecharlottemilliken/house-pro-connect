
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSOW, WorkArea } from "@/components/project/sow/SOWContext";
import { ProjectData, PropertyDetails } from "@/hooks/useProjectData";
import { Card } from "@/components/ui/card";

interface DefineWorkAreasProps {
  projectData: ProjectData | null;
  propertyDetails: PropertyDetails;
}

const DefineWorkAreas: React.FC<DefineWorkAreasProps> = ({ 
  projectData, 
  propertyDetails 
}) => {
  const { sowData, addWorkArea, updateWorkArea, removeWorkArea } = useSOW();
  
  const [newWorkArea, setNewWorkArea] = useState<Partial<WorkArea>>({
    name: '',
    type: 'primary',
    notes: ''
  });

  // Extract renovation areas from project data
  const renovationAreas = projectData?.renovation_areas?.map(area => area.area) || [];

  const handleAddWorkArea = () => {
    if (!newWorkArea.name) return;
    
    const workArea: WorkArea = {
      id: uuidv4(),
      name: newWorkArea.name,
      type: newWorkArea.type as 'primary' | 'secondary',
      notes: newWorkArea.notes || ''
    };
    
    addWorkArea(workArea);
    
    // Reset the form
    setNewWorkArea({
      name: '',
      type: 'primary',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Define Work Areas</h2>
        <p className="mb-4 text-gray-600">
          Identify the primary work areas (main focus of renovation) and 
          secondary/impacted areas that will be affected by the project.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-3">Add Work Area</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="area-name">Area Name</Label>
            <Select 
              value={newWorkArea.name || ''}
              onValueChange={value => setNewWorkArea({...newWorkArea, name: value})}
            >
              <SelectTrigger id="area-name">
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                {renovationAreas.map((area, index) => (
                  <SelectItem key={index} value={area}>
                    {area}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Other (Custom)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {newWorkArea.name === 'custom' && (
            <div>
              <Label htmlFor="custom-area-name">Custom Area Name</Label>
              <Input
                id="custom-area-name"
                placeholder="Enter area name"
                value={newWorkArea.customName || ''}
                onChange={e => setNewWorkArea({...newWorkArea, customName: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="area-type">Area Type</Label>
            <Select 
              value={newWorkArea.type}
              onValueChange={value => setNewWorkArea({...newWorkArea, type: value as 'primary' | 'secondary'})}
            >
              <SelectTrigger id="area-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary Work Area</SelectItem>
                <SelectItem value="secondary">Secondary/Impacted Area</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-4">
          <Label htmlFor="area-notes">Notes (optional)</Label>
          <Textarea
            id="area-notes"
            placeholder="Add notes about this work area"
            value={newWorkArea.notes || ''}
            onChange={e => setNewWorkArea({...newWorkArea, notes: e.target.value})}
            className="h-24"
          />
        </div>
        
        <Button 
          onClick={handleAddWorkArea} 
          className="flex items-center gap-2 bg-[#0f566c]"
          disabled={!newWorkArea.name || (newWorkArea.name === 'custom' && !newWorkArea.customName)}
        >
          <Plus className="h-4 w-4" /> Add Work Area
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="font-medium mb-4">Defined Work Areas</h3>
        
        {sowData.workAreas.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">
            No work areas defined yet. Add some using the form above.
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sowData.workAreas.map((area) => (
            <Card key={area.id} className="p-4 relative">
              <div className="absolute right-2 top-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWorkArea(area.id)}
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-1 flex items-center">
                <h4 className="font-medium text-lg">{area.name}</h4>
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  area.type === 'primary' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {area.type === 'primary' ? 'Primary' : 'Secondary'}
                </span>
              </div>
              
              {area.notes && (
                <p className="text-gray-600 text-sm mt-2">{area.notes}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DefineWorkAreas;
