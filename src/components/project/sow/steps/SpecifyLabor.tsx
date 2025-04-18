
import React, { useState, useMemo } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSOW, LaborItem } from "@/components/project/sow/SOWContext";

// Labor categories with subcategories
const laborCategories = {
  "Demolition": [
    "Interior Demolition",
    "Exterior Demolition",
    "Selective Demolition",
    "Complete Demolition",
    "Wall Removal",
    "Floor Removal",
    "Fixture Removal"
  ],
  "Plumbing": [
    "Rough-in Plumbing",
    "Finish Plumbing",
    "Fixture Installation",
    "Pipe Replacement",
    "Drain Installation",
    "Water Heater Installation",
    "Repiping"
  ],
  "Electrical": [
    "Rough-in Electrical",
    "Finish Electrical",
    "Panel Upgrades",
    "Lighting Installation",
    "Outlet/Switch Installation",
    "Wiring",
    "Smart Home Integration"
  ],
  "Carpentry": [
    "Framing",
    "Finish Carpentry",
    "Cabinet Installation",
    "Door Installation",
    "Window Installation",
    "Trim Work",
    "Custom Built-ins"
  ],
  "Drywall": [
    "Drywall Installation",
    "Drywall Finishing",
    "Patching",
    "Texture Application",
    "Ceiling Work"
  ],
  "Flooring": [
    "Tile Installation",
    "Hardwood Installation",
    "Laminate Installation",
    "Carpet Installation",
    "Floor Leveling",
    "Subfloor Preparation"
  ],
  "Painting": [
    "Interior Painting",
    "Exterior Painting",
    "Surface Preparation",
    "Trim Painting",
    "Specialty Finishes",
    "Staining"
  ],
  "HVAC": [
    "System Installation",
    "Ductwork",
    "Venting",
    "Furnace Installation",
    "AC Installation",
    "Smart Thermostat Integration"
  ],
  "Roofing": [
    "Roof Replacement",
    "Roof Repair",
    "Gutter Installation",
    "Flashing Installation",
    "Skylight Installation"
  ],
  "Masonry": [
    "Brick Work",
    "Stone Work",
    "Concrete Work",
    "Foundation Repair",
    "Tuck Pointing"
  ],
  "Other": [
    "Insulation",
    "Waterproofing",
    "Window Treatments",
    "Cleaning Services",
    "Waste Management",
    "Project Management",
    "Custom Work"
  ]
};

const SpecifyLabor: React.FC = () => {
  const { sowData, addLaborItem, updateLaborItem, removeLaborItem } = useSOW();
  
  const [newLabor, setNewLabor] = useState<Partial<LaborItem>>({
    category: '',
    subcategory: '',
    affectedAreas: [],
    notes: ''
  });
  
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const workAreaOptions = useMemo(() => 
    sowData.workAreas.map(area => ({
      id: area.id,
      label: area.name,
      value: area.name
    })), 
    [sowData.workAreas]
  );

  const availableSubcategories = useMemo(() => 
    newLabor.category ? laborCategories[newLabor.category as keyof typeof laborCategories] || [] : [],
    [newLabor.category]
  );

  const handleAddLabor = () => {
    if (!newLabor.category || !newLabor.subcategory || !newLabor.affectedAreas?.length) return;
    
    const laborItem: LaborItem = {
      id: uuidv4(),
      category: newLabor.category,
      subcategory: newLabor.subcategory,
      affectedAreas: newLabor.affectedAreas,
      notes: newLabor.notes || ''
    };
    
    addLaborItem(laborItem);
    
    // Reset the form
    setNewLabor({
      category: '',
      subcategory: '',
      affectedAreas: [],
      notes: ''
    });
  };

  const toggleItemOpen = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAreaToggle = (checked: boolean, areaName: string) => {
    setNewLabor(prev => {
      const currentAreas = prev.affectedAreas || [];
      if (checked) {
        return { ...prev, affectedAreas: [...currentAreas, areaName] };
      } else {
        return { ...prev, affectedAreas: currentAreas.filter(area => area !== areaName) };
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Specify Required Labor</h2>
        <p className="mb-4 text-gray-600">
          Define all labor categories and subcategories required for the project. 
          Indicate which work areas will be affected by each labor type.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-3">Add Labor Requirement</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="labor-category">Labor Category</Label>
            <Select 
              value={newLabor.category || ''}
              onValueChange={value => setNewLabor({...newLabor, category: value, subcategory: ''})}
            >
              <SelectTrigger id="labor-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(laborCategories).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="labor-subcategory">Subcategory</Label>
            <Select 
              value={newLabor.subcategory || ''}
              onValueChange={value => setNewLabor({...newLabor, subcategory: value})}
              disabled={!newLabor.category}
            >
              <SelectTrigger id="labor-subcategory">
                <SelectValue placeholder={!newLabor.category ? "Select category first" : "Select subcategory"} />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <Label className="mb-2 block">Affected Areas</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {workAreaOptions.map((area) => (
              <div key={area.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`area-${area.id}`}
                  checked={(newLabor.affectedAreas || []).includes(area.value)}
                  onCheckedChange={(checked) => handleAreaToggle(!!checked, area.value)}
                />
                <label
                  htmlFor={`area-${area.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {area.label}
                </label>
              </div>
            ))}
          </div>
          {workAreaOptions.length === 0 && (
            <p className="text-amber-600 text-sm">
              No work areas defined. Please go back and define work areas first.
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <Label htmlFor="labor-notes">Notes (optional)</Label>
          <Textarea
            id="labor-notes"
            placeholder="Add notes about this labor requirement"
            value={newLabor.notes || ''}
            onChange={e => setNewLabor({...newLabor, notes: e.target.value})}
            className="h-24"
          />
        </div>
        
        <Button 
          onClick={handleAddLabor} 
          className="flex items-center gap-2 bg-[#0f566c]"
          disabled={!newLabor.category || !newLabor.subcategory || !(newLabor.affectedAreas || []).length}
        >
          <Plus className="h-4 w-4" /> Add Labor Item
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="font-medium mb-4">Specified Labor Requirements</h3>
        
        {sowData.laborItems.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">
            No labor requirements defined yet. Add some using the form above.
          </div>
        )}
        
        <div className="space-y-3">
          {sowData.laborItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <Collapsible 
                open={openItems[item.id]} 
                onOpenChange={() => toggleItemOpen(item.id)}
              >
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.category} - {item.subcategory}</div>
                    <div className="text-sm text-gray-500">
                      Affects: {item.affectedAreas.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLaborItem(item.id)}
                      className="h-8 w-8 mr-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8">
                        {openItems[item.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4">
                    {item.notes ? (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Notes:</h4>
                        <p className="text-sm text-gray-600">{item.notes}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No additional notes</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecifyLabor;
