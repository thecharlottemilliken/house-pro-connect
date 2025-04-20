
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronDown } from "lucide-react";

interface LaborItem {
  category: string;
  task: string;
  rooms: Array<{
    name: string;
    notes: string;
    sqft?: number;
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
      tasks: ["Install new outlets", "Upgrade electrical panel", "Install lighting fixtures"]
    },
    {
      name: "Plumbing",
      tasks: ["Replace pipes", "Install new fixtures", "Water heater installation"]
    },
    {
      name: "Building",
      tasks: ["Wall construction", "Flooring installation", "Cabinet installation"]
    }
  ],
  exterior: [
    {
      name: "Roofing",
      tasks: ["Roof repair", "Gutter installation", "Skylight installation"]
    },
    {
      name: "Siding",
      tasks: ["Siding replacement", "Trim work", "External insulation"]
    }
  ]
};

export function LaborRequirementsForm({ workAreas, onSave }: Props) {
  const [location, setLocation] = useState<"interior" | "exterior">("interior");
  const [selectedItems, setSelectedItems] = useState<LaborItem[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleAddTask = (category: string, task: string) => {
    const newItem: LaborItem = {
      category,
      task,
      rooms: []
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const handleUpdateRooms = (itemIndex: number, rooms: Array<{ name: string; notes: string; sqft?: number }>) => {
    const updatedItems = [...selectedItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      rooms
    };
    setSelectedItems(updatedItems);
  };

  return (
    <div className="flex gap-6">
      <div className="w-72 flex-shrink-0">
        <Tabs defaultValue="interior" onValueChange={(value) => setLocation(value as "interior" | "exterior")}>
          <TabsList className="w-full">
            <TabsTrigger value="interior" className="flex-1">Interior</TabsTrigger>
            <TabsTrigger value="exterior" className="flex-1">Exterior</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Select Labor Items</h3>
          <Accordion type="single" collapsible>
            {specialtyCategories[location].map((category) => (
              <AccordionItem key={category.name} value={category.name}>
                <AccordionTrigger>{category.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-2">
                    {category.tasks.map((task) => (
                      <Button
                        key={task}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleAddTask(category.name, task)}
                      >
                        {task}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-6">Selected Items</h2>
        <div className="space-y-4">
          {selectedItems.map((item, index) => (
            <Card key={`${item.category}-${item.task}-${index}`} className="p-4">
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
                  <Label>Affected Areas</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {workAreas.map((area: any) => (
                      <div key={area.name} className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${area.name}-${index}`}
                            checked={item.rooms.some(room => room.name === area.name)}
                            onChange={(e) => {
                              let updatedRooms = [...item.rooms];
                              if (e.target.checked) {
                                updatedRooms.push({ name: area.name, notes: "" });
                              } else {
                                updatedRooms = updatedRooms.filter(room => room.name !== area.name);
                              }
                              handleUpdateRooms(index, updatedRooms);
                            }}
                          />
                          <Label htmlFor={`${area.name}-${index}`}>{area.name}</Label>
                        </div>
                        {item.rooms.some(room => room.name === area.name) && (
                          <div className="space-y-2">
                            <Input
                              type="number"
                              placeholder="Square footage"
                              value={item.rooms.find(room => room.name === area.name)?.sqft || ""}
                              onChange={(e) => {
                                const updatedRooms = item.rooms.map(room => {
                                  if (room.name === area.name) {
                                    return { ...room, sqft: parseInt(e.target.value) || undefined };
                                  }
                                  return room;
                                });
                                handleUpdateRooms(index, updatedRooms);
                              }}
                            />
                            <Textarea
                              placeholder={`Notes for ${area.name}`}
                              value={item.rooms.find(room => room.name === area.name)?.notes || ""}
                              onChange={(e) => {
                                const updatedRooms = item.rooms.map(room => {
                                  if (room.name === area.name) {
                                    return { ...room, notes: e.target.value };
                                  }
                                  return room;
                                });
                                handleUpdateRooms(index, updatedRooms);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-6">
            <Button onClick={() => onSave(selectedItems)}>Continue</Button>
          </div>
        )}
      </div>
    </div>
  );
}
