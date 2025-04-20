
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      category: "Electrical",
      items: ["Rough and Fixture", "Backup Generator", "Solar"]
    },
    {
      category: "Plumbing",
      items: ["Rough In", "Fixtures", "Water Heater"]
    }
  ],
  exterior: [
    {
      category: "Landscaping",
      items: ["Irrigation", "Planting", "Hardscape"]
    }
  ]
};

export function LaborRequirementsForm({ workAreas, onSave }: LaborRequirementsFormProps) {
  const [activeTab, setActiveTab] = useState("interior");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItems, setSelectedItems] = useState<LaborItem[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  const addLaborItem = (itemName: string) => {
    if (!selectedItems.find(item => item.name === itemName)) {
      setSelectedItems([...selectedItems, {
        category: selectedCategory,
        name: itemName,
        affectedAreas: selectedAreas,
        notes: itemNotes
      }]);
    }
  };

  const removeLaborItem = (itemName: string) => {
    setSelectedItems(selectedItems.filter(item => item.name !== itemName));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="interior" className="w-[400px]" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="interior" className="flex-1">Interior</TabsTrigger>
          <TabsTrigger value="exterior" className="flex-1">Exterior</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 col-span-1">
          <div className="space-y-4">
            <Select onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {laborCategories[activeTab as keyof typeof laborCategories].map(cat => (
                  <SelectItem key={cat.category} value={cat.category}>
                    {cat.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory && (
              <div className="space-y-2">
                <Label>Select Labor Items to Add</Label>
                {laborCategories[activeTab as keyof typeof laborCategories]
                  .find(cat => cat.category === selectedCategory)
                  ?.items.map(item => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={selectedItems.some(si => si.name === item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addLaborItem(item);
                          } else {
                            removeLaborItem(item);
                          }
                        }}
                      />
                      <Label htmlFor={item}>{item}</Label>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 col-span-2">
          <h3 className="text-lg font-medium mb-4">Select Items from the checklist</h3>
          {selectedItems.length === 0 ? (
            <p className="text-muted-foreground">No labor items selected.</p>
          ) : (
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <Card key={item.name} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-medium">{item.category}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeLaborItem(item.name)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="pl-4 space-y-2">
                      <div className="flex items-center">
                        <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
                        {item.name}
                      </div>
                      <div className="space-y-2">
                        <Label>Affected Areas</Label>
                        <Select 
                          onValueChange={(value) => {
                            const areas = value.split(",");
                            setSelectedAreas(areas);
                          }}
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
                        {selectedAreas.map(area => (
                          <div key={area} className="space-y-2">
                            <Label>Notes for {area}</Label>
                            <Textarea
                              placeholder={`Enter notes for ${area}...`}
                              value={itemNotes[area] || ""}
                              onChange={(e) => setItemNotes({
                                ...itemNotes,
                                [area]: e.target.value
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
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
