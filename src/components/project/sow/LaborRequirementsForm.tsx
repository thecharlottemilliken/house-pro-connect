
import React, { useState } from 'react';
import { Accordion } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { LocationTypeTabs } from "./LocationTypeTabs";
import { LaborItemCard } from "./LaborItemCard";
import { TabsContent, Tabs } from '@/components/ui/tabs';
import type { LaborItem, LaborCategory, WorkArea } from "./types";

const laborCategories: LaborCategory[] = [
  {
    name: "Paint & Wallpaper",
    items: ["Interior Painting", "Wallpaper Installation", "Wallpaper Removal", "Texture Application"],
  },
  {
    name: "Flooring",
    items: ["Hardwood Installation", "Tile Installation", "Carpet Installation", "Floor Leveling"],
  },
  {
    name: "Electrical",
    items: ["Outlet Installation", "Light Fixture Installation", "Panel Upgrade", "Wiring"],
  },
  {
    name: "Plumbing",
    items: ["Pipe Installation", "Fixture Installation", "Drain Repair", "Water Heater"],
  },
  {
    name: "HVAC",
    items: ["AC Installation", "Heating Installation", "Ductwork", "Ventilation"],
  },
  {
    name: "Carpentry",
    items: ["Cabinet Installation", "Door Installation", "Trim Work", "Custom Built-ins"],
  }
];

interface LaborRequirementsFormProps {
  workAreas: WorkArea[];
  onSave: (laborItems: LaborItem[]) => void;
}

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
      setSelectedItems(prev => [...prev, {
        category,
        name: itemName,
        affectedAreas: [{
          room: "",
          notes: "",
          sqft: ""
        }]
      }]);
    }
  };

  const handleAddAreaToItem = (itemIndex: number) => {
    const updatedItems = [...selectedItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      affectedAreas: [
        ...updatedItems[itemIndex].affectedAreas,
        { room: "", notes: "", sqft: "" }
      ]
    };
    setSelectedItems(updatedItems);
  };

  return (
    <div className="space-y-6">
      <LocationTypeTabs activeTab={locationType} onTabChange={setLocationType} />
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-4">
          {laborCategories.map(category => (
            <div key={category.name} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50"
              >
                <span className="font-medium">{category.name}</span>
                {expandedCategories.includes(category.name) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedCategories.includes(category.name) && (
                <div className="border-t">
                  {category.items.map(item => {
                    const isSelected = selectedItems.some(si => si.name === item);
                    return (
                      <button
                        key={item}
                        className="flex items-center justify-between w-full p-3 text-sm hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => handleAddLaborItem(category.name, item)}
                        disabled={isSelected}
                      >
                        <span className={isSelected ? "text-gray-400" : ""}>
                          {item}
                        </span>
                        {!isSelected && <Plus className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-9">
          <Tabs value={locationType}>
            <TabsContent value="interior" className="space-y-4">
              <Accordion type="multiple" className="space-y-2">
                {selectedItems.map((item, index) => (
                  <LaborItemCard
                    key={`${item.name}-${index}`}
                    item={item}
                    workAreas={workAreas}
                    onRemove={() => {
                      setSelectedItems(items => items.filter((_, i) => i !== index));
                    }}
                    onAddArea={() => handleAddAreaToItem(index)}
                    onAreaChange={(areaIndex, room) => {
                      const updatedItems = [...selectedItems];
                      updatedItems[index].affectedAreas[areaIndex].room = room;
                      setSelectedItems(updatedItems);
                    }}
                    onNotesChange={(areaIndex, notes) => {
                      const updatedItems = [...selectedItems];
                      updatedItems[index].affectedAreas[areaIndex].notes = notes;
                      setSelectedItems(updatedItems);
                    }}
                    onSqftChange={(areaIndex, sqft) => {
                      const updatedItems = [...selectedItems];
                      updatedItems[index].affectedAreas[areaIndex].sqft = sqft;
                      setSelectedItems(updatedItems);
                    }}
                  />
                ))}
              </Accordion>
            </TabsContent>
            <TabsContent value="exterior" className="space-y-4">
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
