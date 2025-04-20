
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialItemAccordion } from './MaterialItemAccordion';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface MaterialItem {
  category: string;
  type: string;
  rooms: Array<{
    name: string;
    notes: string;
    affectedAreas?: Array<{
      name: string;
      notes: string;
    }>;
  }>;
  specifications?: {
    [key: string]: any;
  };
}

interface Props {
  workAreas: any[];
  onSave: (items: MaterialItem[]) => void;
  materialItems?: MaterialItem[];
  initialData?: MaterialItem[];
}

const materialCategories = {
  interior: [
    {
      name: "Finishes",
      items: ["Cabinets", "Countertops", "Architectural Millwork", "Flooring", "Appliances", "Shower Doors"]
    },
    {
      name: "Plumbing",
      items: ["Faucets", "Sinks", "Toilets", "Showers"]
    }
  ],
  exterior: [
    {
      name: "Siding",
      items: ["Vinyl Siding", "Wood Siding", "Fiber Cement"]
    },
    {
      name: "Roofing",
      items: ["Shingles", "Metal Roofing", "Tiles"]
    }
  ]
};

export function MaterialRequirementsForm({ workAreas, onSave, materialItems = [], initialData = [] }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Finishes");
  const [selectedItems, setSelectedItems] = useState<MaterialItem[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setSelectedItems(initialData);
    } else if (materialItems && materialItems.length > 0) {
      setSelectedItems(materialItems);
    }
  }, [initialData, materialItems]);

  const getItemsByCategory = (category: string) => {
    return [...materialCategories.interior, ...materialCategories.exterior]
      .find(c => c.name === category)?.items || [];
  };

  const handleCheckItem = (category: string, type: string) => {
    const exists = selectedItems.some(
      item => item.category === category && item.type === type
    );

    if (exists) {
      setSelectedItems(selectedItems.filter(
        item => !(item.category === category && item.type === type)
      ));
    } else {
      setSelectedItems([...selectedItems, { 
        category, 
        type, 
        rooms: [],
        specifications: {}
      }]);
    }
  };
  
  // Add a submit button handler that explicitly calls onSave with selectedItems
  const handleSubmit = () => {
    onSave(selectedItems);
  };

  return (
    <div className="flex gap-6 min-h-[600px]">
      <div className="w-72 flex-shrink-0 bg-white rounded-lg border p-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue>{selectedCategory}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[...new Set([...materialCategories.interior, ...materialCategories.exterior].map(c => c.name))].map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-6 space-y-2">
          {getItemsByCategory(selectedCategory).map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={item}
                checked={selectedItems.some(
                  si => si.category === selectedCategory && si.type === item
                )}
                onCheckedChange={() => handleCheckItem(selectedCategory, item)}
              />
              <Label
                htmlFor={item}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-6">Select Items from the checklist</h2>
        
        {Object.entries(
          selectedItems.reduce((acc, item) => {
            if (!acc[item.category]) {
              acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
          }, {} as Record<string, MaterialItem[]>)
        ).map(([category, items]) => (
          <Card key={category} className="mb-4">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between"
              onClick={() => setOpenCategory(openCategory === category ? null : category)}
            >
              <div>
                <h3 className="text-xl font-medium">{category}</h3>
                <p className="text-gray-500">{items.length} Material Items</p>
              </div>
              {openCategory === category ? (
                <ChevronUp className="h-6 w-6 text-gray-400" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-400" />
              )}
            </div>
            
            {openCategory === category && items.map((item, itemIndex) => (
              <div key={`${item.category}-${item.type}-${itemIndex}`} className="border-t">
                <div className="px-6 py-4 bg-gray-50">
                  <h4 className="text-lg font-medium text-gray-700">
                    {item.type} in {category}
                  </h4>
                </div>
                <MaterialItemAccordion
                  category={item.category}
                  materialType={item.type}
                  workAreas={workAreas}
                  selectedRooms={item.rooms}
                  onUpdateRooms={(rooms) => {
                    const updatedItems = [...selectedItems];
                    const index = updatedItems.findIndex(
                      i => i.category === item.category && i.type === item.type
                    );
                    updatedItems[index] = { ...updatedItems[index], rooms };
                    setSelectedItems(updatedItems);
                  }}
                  onUpdateSpecifications={(specs) => {
                    const updatedItems = [...selectedItems];
                    const index = updatedItems.findIndex(
                      i => i.category === item.category && i.type === item.type
                    );
                    updatedItems[index] = { 
                      ...updatedItems[index], 
                      specifications: specs 
                    };
                    setSelectedItems(updatedItems);
                  }}
                />
              </div>
            ))}
          </Card>
        ))}
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Material Requirements
          </Button>
        </div>
      </div>
    </div>
  );
}
