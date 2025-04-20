
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
      name: "Building",
      items: ["Wall construction", "Flooring installation", "Cabinet installation"]
    },
    {
      name: "Electrical",
      items: ["Install new outlets", "Upgrade electrical panel", "Install lighting fixtures"]
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
          To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
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
            <h3 className="text-lg font-semibold mb-4">Select Labor Items</h3>
            {specialtyCategories[location].map((category) => (
              <Collapsible key={category.name}>
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <span>{category.name}</span>
                  <ChevronDown className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <Button
                        key={item}
                        variant="ghost"
                        className="w-full justify-start text-gray-700"
                        onClick={() => handleAddTask(category.name, item)}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-6">Select Items from the checklist</h2>
          {selectedItems.map((item, index) => (
            <Card key={`${item.category}-${item.task}-${index}`} className="mb-4 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{item.category}</h3>
                  <p className="text-gray-600">{item.task}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const filtered = selectedItems.filter((_, i) => i !== index);
                    setSelectedItems(filtered);
                  }}
                >
                  Remove
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Affected Areas</label>
                  <Select
                    value={item.rooms.map(r => r.name).join(", ")}
                    onValueChange={(value) => {
                      const selectedRooms = value.split(", ").map(name => ({
                        name,
                        notes: item.rooms.find(r => r.name === name)?.notes || ""
                      }));
                      handleUpdateRooms(index, selectedRooms);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {workAreas.map((area: any) => (
                        <SelectItem key={area.name} value={area.name}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {item.rooms.map((room) => (
                  <div key={room.name} className="space-y-2">
                    <label className="block text-sm font-medium">{room.name} Notes</label>
                    <Textarea
                      placeholder={`Notes for ${room.name}`}
                      value={room.notes}
                      onChange={(e) => {
                        const updatedRooms = item.rooms.map(r => {
                          if (r.name === room.name) {
                            return { ...r, notes: e.target.value };
                          }
                          return r;
                        });
                        handleUpdateRooms(index, updatedRooms);
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
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
