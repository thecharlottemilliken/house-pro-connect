
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LaborItemAccordion } from './LaborItemAccordion';

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
  const [location, setLocation] = useState<"interior" | "exterior">("interior");
  const [selectedItems, setSelectedItems] = useState<LaborItem[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleAddTask = (category: string, task: string) => {
    const newItem: LaborItem = {
      category,
      task,
      rooms: []
    };
    setSelectedItems([...selectedItems, newItem]);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Specify Labor</h1>
        <p className="text-gray-600">
          Select items from the checklist and specify which areas they affect.
        </p>
      </div>

      <div className="flex gap-6">
        <div className="w-72 flex-shrink-0">
          <Tabs value={location} onValueChange={(value) => setLocation(value as "interior" | "exterior")}>
            <TabsList className="w-full">
              <TabsTrigger value="interior" className="flex-1">Interior</TabsTrigger>
              <TabsTrigger value="exterior" className="flex-1">Exterior</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Select Items from the checklist</h3>
            {specialtyCategories[location].map((category) => (
              <div key={category.name} className="mb-4">
                <h4 className="text-base font-medium mb-2">{category.name}</h4>
                {category.items.map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className="w-full justify-start text-gray-700 mb-1"
                    onClick={() => handleAddTask(category.name, item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-6">Selected Labor Items</h2>
          {selectedItems.map((item, index) => (
            <LaborItemAccordion
              key={`${item.category}-${item.task}-${index}`}
              category={item.category}
              itemCount={1}
              isOpen={openCategory === `${item.category}-${index}`}
              onToggle={() => {
                setOpenCategory(openCategory === `${item.category}-${index}` ? null : `${item.category}-${index}`);
              }}
              workAreas={workAreas}
              selectedRooms={item.rooms}
              onUpdateRooms={(rooms) => handleUpdateRooms(index, rooms)}
            />
          ))}

          {selectedItems.length > 0 && (
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
              <Button onClick={() => onSave(selectedItems)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
