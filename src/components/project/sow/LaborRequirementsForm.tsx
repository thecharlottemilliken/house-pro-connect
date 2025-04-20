
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

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

interface LaborItem {
  category: string;
  name: string;
  affectedAreas: string[];
  notes: Record<string, string>;
}

interface LaborRequirementsFormProps {
  workAreas: WorkArea[];
  onSave: (laborItems: LaborItem[]) => void;
}

const laborCategories = {
  interior: [
    {
      category: "General Labor",
      items: ["Demo", "Cleanup", "Hauling", "Site Protection"]
    },
    {
      category: "Drywall",
      items: ["Repair", "New Installation", "Texture", "Finishing"]
    },
    {
      category: "Electrical",
      items: ["Rough and Fixture", "Panel Upgrade", "New Circuits", "Lighting"]
    },
    {
      category: "Plumbing",
      items: ["Rough In", "Fixtures", "Water Heater", "Gas Lines"]
    },
    {
      category: "Flooring",
      items: ["Tile", "Hardwood", "Laminate", "Carpet"]
    }
  ],
  exterior: [
    {
      category: "Landscaping",
      items: ["Irrigation", "Planting", "Hardscape", "Fencing"]
    },
    {
      category: "Roofing",
      items: ["Repair", "Replacement", "Gutters", "Ventilation"]
    }
  ]
};

export function LaborRequirementsForm({ workAreas, onSave }: LaborRequirementsFormProps) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<LaborItem[]>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [currentCategory, setCurrentCategory] = useState("General Labor");

  const handleAddLaborItem = (itemName: string) => {
    if (!selectedItems.find(item => item.name === itemName)) {
      setSelectedItems([...selectedItems, {
        category: currentCategory,
        name: itemName,
        affectedAreas: selectedAreas,
        notes: itemNotes
      }]);
    }
  };

  const handleRemoveLaborItem = (itemName: string) => {
    setSelectedItems(selectedItems.filter(item => item.name !== itemName));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="font-semibold text-lg mb-4">Labor Categories</h3>
              <RadioGroup 
                defaultValue="General Labor"
                onValueChange={setCurrentCategory}
                className="space-y-3"
              >
                {laborCategories.interior.map(cat => (
                  <div key={cat.category} className="flex items-center space-x-2">
                    <RadioGroupItem value={cat.category} id={cat.category} />
                    <Label htmlFor={cat.category}>{cat.category}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Card>
        </div>

        <div className="col-span-9 space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{currentCategory} Items</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {laborCategories.interior
                  .find(cat => cat.category === currentCategory)
                  ?.items.map(item => (
                    <Card key={item} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item}</span>
                        {selectedItems.some(si => si.name === item) ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveLaborItem(item)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAddLaborItem(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </Card>

          {selectedItems.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Selected Labor Items</h3>
              <div className="space-y-4">
                {selectedItems.map((item, index) => (
                  <Card key={`${item.name}-${index}`} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{item.category}</h4>
                          <p className="text-sm text-muted-foreground">{item.name}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveLaborItem(item.name)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Select Affected Areas</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {workAreas.map(area => (
                            <div key={area.name} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${item.name}-${area.name}`}
                                checked={item.affectedAreas.includes(area.name)}
                                onChange={(e) => {
                                  const newAreas = e.target.checked
                                    ? [...item.affectedAreas, area.name]
                                    : item.affectedAreas.filter(a => a !== area.name);
                                  
                                  const updatedItems = [...selectedItems];
                                  updatedItems[index] = {
                                    ...item,
                                    affectedAreas: newAreas
                                  };
                                  setSelectedItems(updatedItems);
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <Label htmlFor={`${item.name}-${area.name}`}>{area.name}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {item.affectedAreas.map(area => (
                        <div key={area} className="space-y-2">
                          <Label>Notes for {area}</Label>
                          <Textarea
                            placeholder={`Enter notes for ${item.name} in ${area}...`}
                            value={item.notes[area] || ""}
                            onChange={(e) => {
                              const updatedItems = [...selectedItems];
                              updatedItems[index] = {
                                ...item,
                                notes: {
                                  ...item.notes,
                                  [area]: e.target.value
                                }
                              };
                              setSelectedItems(updatedItems);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button onClick={() => onSave(selectedItems)}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
