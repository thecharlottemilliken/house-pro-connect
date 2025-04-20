
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";

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

interface LaborCategory {
  name: string;
  items: string[];
  expanded?: boolean;
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

const laborCategories: LaborCategory[] = [
  {
    name: "Building",
    items: ["Demolition", "Framing", "Insulation", "Drywall"],
  },
  {
    name: "Electrical",
    items: ["Wiring", "Panel Upgrade", "Fixtures", "Smart Home"],
  },
  {
    name: "Plumbing",
    items: ["Pipes", "Fixtures", "Water Heater", "Drain Lines"],
  },
  {
    name: "HVAC",
    items: ["Ductwork", "Installation", "Ventilation"],
  }
];

export function LaborRequirementsForm({ workAreas, onSave }: LaborRequirementsFormProps) {
  const [selectedItems, setSelectedItems] = useState<LaborItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleAddLaborItem = (category: string, itemName: string) => {
    if (!selectedItems.find(item => item.name === itemName)) {
      setSelectedItems([...selectedItems, {
        category,
        name: itemName,
        affectedAreas: [],
        notes: {}
      }]);
    }
  };

  const handleRemoveLaborItem = (itemName: string) => {
    setSelectedItems(selectedItems.filter(item => item.name !== itemName));
  };

  const updateItemAffectedAreas = (itemIndex: number, areas: string[]) => {
    const updatedItems = [...selectedItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      affectedAreas: areas,
      notes: areas.reduce((acc, area) => ({
        ...acc,
        [area]: updatedItems[itemIndex].notes[area] || ""
      }), {})
    };
    setSelectedItems(updatedItems);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Select defaultValue="Building">
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {laborCategories.map(cat => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-9 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Select Items from the checklist</h3>

          {laborCategories.map(category => (
            <Card key={category.name} className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleCategory(category.name)}
              >
                <div>
                  <h4 className="font-medium text-lg">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {category.items.length} Labor Items
                  </p>
                </div>
                {expandedCategories.includes(category.name) ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>

              {expandedCategories.includes(category.name) && (
                <div className="mt-4 space-y-3">
                  {category.items.map(item => {
                    const isSelected = selectedItems.some(si => si.name === item);
                    return (
                      <div key={item} className="flex items-center justify-between p-3 bg-muted/10 rounded-md">
                        <span>{item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => isSelected 
                            ? handleRemoveLaborItem(item)
                            : handleAddLaborItem(category.name, item)
                          }
                        >
                          {isSelected ? (
                            <Minus className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}

          {selectedItems.length > 0 && (
            <div className="space-y-6 mt-8">
              {selectedItems.map((item, index) => (
                <Card key={`${item.name}-${index}`} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLaborItem(item.name)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <Label>Affected Areas</Label>
                      <Select
                        defaultValue={item.affectedAreas.join(",")}
                        onValueChange={(value) => updateItemAffectedAreas(index, value.split(",").filter(Boolean))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select affected areas" />
                        </SelectTrigger>
                        <SelectContent>
                          {workAreas.map(area => (
                            <SelectItem key={area.name} value={area.name}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {item.affectedAreas.map(area => (
                        <div key={area} className="space-y-2">
                          <Label>{area} Notes</Label>
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
                  </div>
                </Card>
              ))}
            </div>
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
