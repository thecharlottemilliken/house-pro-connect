
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LaborItemAccordion } from './LaborItemAccordion';
import { Checkbox } from "@/components/ui/checkbox";

interface LaborItem {
  category: string;
  task: string;
  rooms: Array<{
    name: string;
    notes: string;
  }>;
}

interface Props {
  workAreas: any[];
  onSave: (items: LaborItem[]) => void;
}

const specialtyCategories = {
  interior: [
    {
      name: "Electrical",
      items: ["Install new outlets", "Upgrade electrical panel", "Install lighting fixtures"]
    },
    {
      name: "Building",
      items: ["Wall construction", "Flooring installation", "Cabinet installation"]
    }
  ],
  exterior: [
    {
      name: "Roofing",
      items: ["Roof repair", "Gutter installation", "Skylight installation"]
    },
    {
      name: "Siding",
      items: ["Siding replacement", "Trim work", "External insulation"]
    }
  ]
};

export function LaborRequirementsForm({ workAreas, onSave }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Building");
  const [selectedItems, setSelectedItems] = useState<LaborItem[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const getItemsByCategory = (category: string) => {
    return [...specialtyCategories.interior, ...specialtyCategories.exterior]
      .find(c => c.name === category)?.items || [];
  };

  const handleCheckItem = (category: string, task: string) => {
    const exists = selectedItems.some(
      item => item.category === category && item.task === task
    );

    if (exists) {
      setSelectedItems(selectedItems.filter(
        item => !(item.category === category && item.task === task)
      ));
    } else {
      setSelectedItems([...selectedItems, { category, task, rooms: [] }]);
    }
  };

  const handleUpdateRooms = (itemIndex: number, rooms: Array<{ name: string; notes: string }>) => {
    const updatedItems = [...selectedItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      rooms
    };
    setSelectedItems(updatedItems);
  };

  return (
    <div className="flex gap-6 min-h-[600px]">
      <div className="w-72 flex-shrink-0 bg-white rounded-lg border p-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue>{selectedCategory}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[...new Set([...specialtyCategories.interior, ...specialtyCategories.exterior].map(c => c.name))].map(category => (
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
                  si => si.category === selectedCategory && si.task === item
                )}
                onCheckedChange={() => handleCheckItem(selectedCategory, item)}
              />
              <label
                htmlFor={item}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item}
              </label>
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
          }, {} as Record<string, LaborItem[]>)
        ).map(([category, items], categoryIndex) => (
          <Card key={category} className="mb-4">
            <div 
              className="p-6 cursor-pointer flex items-center justify-between"
              onClick={() => setOpenCategory(openCategory === category ? null : category)}
            >
              <div>
                <h3 className="text-xl font-medium">{category}</h3>
                <p className="text-gray-500">{items.length} Labor Items</p>
              </div>
              {openCategory === category ? (
                <ChevronUp className="h-6 w-6 text-gray-400" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-400" />
              )}
            </div>
            
            {openCategory === category && items.map((item, itemIndex) => (
              <LaborItemAccordion
                key={`${item.category}-${item.task}-${itemIndex}`}
                category={item.category}
                itemCount={1}
                isOpen={true}
                onToggle={() => {}}
                workAreas={workAreas}
                selectedRooms={item.rooms}
                onUpdateRooms={(rooms) => {
                  const globalIndex = selectedItems.findIndex(
                    si => si.category === item.category && si.task === item.task
                  );
                  handleUpdateRooms(globalIndex, rooms);
                }}
              />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
