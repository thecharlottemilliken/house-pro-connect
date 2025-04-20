
import React, { useState } from 'react';
import { Accordion } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { LocationTypeTabs } from "./LocationTypeTabs";
import { LaborItemCard } from "./LaborItemCard";
import { TabsContent, Tabs } from '@/components/ui/tabs';

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

const laborCategories = [
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
  const [locationType, setLocationType] = useState("interior");
  const [selectedCategory, setSelectedCategory] = useState(laborCategories[0].name);
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

  return (
    <div className="space-y-6">
      <LocationTypeTabs activeTab={locationType} onTabChange={setLocationType} />
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
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
          
          <div className="mt-4">
            <Label className="text-sm font-medium">Select Labor Items</Label>
            {laborCategories.map(category => (
              <div key={category.name} className="my-2">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-100 rounded"
                >
                  <span>{category.name}</span>
                  {expandedCategories.includes(category.name) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedCategories.includes(category.name) && (
                  <div className="ml-4 space-y-2 mt-2">
                    {category.items.map(item => {
                      const isSelected = selectedItems.some(si => si.name === item);
                      return (
                        <button
                          key={item}
                          className="flex items-center justify-between w-full p-2 text-sm hover:bg-gray-100 rounded"
                          onClick={() => handleAddLaborItem(category.name, item)}
                        >
                          <span>{item}</span>
                          {!isSelected && <Plus className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-9">
          <h3 className="text-lg font-semibold mb-4">Select Items from the checklist</h3>
          <Tabs value={locationType}>
            <TabsContent value="interior" className="space-y-4">
              <Accordion type="multiple" className="space-y-2">
                {selectedItems.map((item, index) => (
                  <LaborItemCard
                    key={`${item.name}-${index}`}
                    item={item}
                    workAreas={workAreas}
                    onRemove={() => {
                      setSelectedItems(items => items.filter(i => i.name !== item.name));
                    }}
                    onAreaChange={(areas) => {
                      const updatedItems = [...selectedItems];
                      updatedItems[index] = {
                        ...updatedItems[index],
                        affectedAreas: areas,
                        notes: areas.reduce((acc, area) => ({
                          ...acc,
                          [area]: updatedItems[index].notes[area] || ""
                        }), {})
                      };
                      setSelectedItems(updatedItems);
                    }}
                    onNotesChange={(area, notes) => {
                      const updatedItems = [...selectedItems];
                      updatedItems[index] = {
                        ...updatedItems[index],
                        notes: {
                          ...updatedItems[index].notes,
                          [area]: notes
                        }
                      };
                      setSelectedItems(updatedItems);
                    }}
                  />
                ))}
              </Accordion>
            </TabsContent>
            <TabsContent value="exterior" className="space-y-4">
              {/* Mirror the interior content structure for exterior */}
              <p className="text-muted-foreground">No exterior items selected</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
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
