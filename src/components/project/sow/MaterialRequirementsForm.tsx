
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialItemAccordion } from './MaterialItemAccordion';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MaterialItemRevisionProps } from './components/RevisionAwareFormProps';

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
    specifications?: {
      [key: string]: any;
    };
  }>;
  specifications?: {
    [key: string]: any;
  };
}

interface Props extends MaterialItemRevisionProps {
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

export function MaterialRequirementsForm({ 
  workAreas, 
  onSave, 
  materialItems = [], 
  initialData = [],
  isRevision = false,
  changedMaterialItems = {}
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Finishes");
  const [selectedItems, setSelectedItems] = useState<MaterialItem[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [modifiedItems, setModifiedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setSelectedItems(initialData);
    } else if (materialItems && materialItems.length > 0) {
      setSelectedItems(materialItems);
    }
    
    // If in revision mode, track initial items for change highlighting
    if (isRevision) {
      const initialItemMap: Record<string, boolean> = {};
      const itemsToTrack = initialData.length > 0 ? initialData : materialItems;
      itemsToTrack.forEach(item => {
        const key = `${item.category}-${item.type}`;
        initialItemMap[key] = true;
      });
      setModifiedItems(initialItemMap);
    }
  }, [initialData, materialItems, isRevision]);

  const getItemsByCategory = (category: string) => {
    return [...materialCategories.interior, ...materialCategories.exterior]
      .find(c => c.name === category)?.items || [];
  };

  const handleCheckItem = (category: string, type: string) => {
    const itemKey = `${category}-${type}`;
    const exists = selectedItems.some(
      item => item.category === category && item.type === type
    );

    if (exists) {
      // Removing an item
      setSelectedItems(selectedItems.filter(
        item => !(item.category === category && item.type === type)
      ));
      
      // Track item modification if in revision mode
      if (isRevision) {
        console.log(`Removing material item in revision mode: ${itemKey}`);
        setModifiedItems(prev => ({
          ...prev,
          [itemKey]: !prev[itemKey] // Toggle modification state
        }));
      }
    } else {
      // Adding an item
      setSelectedItems([...selectedItems, { 
        category, 
        type, 
        rooms: [],
        specifications: {}
      }]);
      
      // Track item modification if in revision mode
      if (isRevision) {
        console.log(`Adding material item in revision mode: ${itemKey}`);
        setModifiedItems(prev => ({
          ...prev,
          [itemKey]: !prev[itemKey] // Toggle modification state
        }));
      }
    }
  };

  const handleSave = () => {
    console.log("Saving material items:", selectedItems);
    onSave(selectedItems);
    toast({
      title: "Material requirements saved",
      description: "Your material selections have been saved successfully."
    });
  };

  // Determine if an item should be highlighted in revision mode
  const isItemHighlighted = (category: string, type: string): boolean => {
    if (!isRevision) return false;
    
    const itemKey = `${category}-${type}`;
    // Item is highlighted if it's in changedMaterialItems or was modified in this session
    return (
      (changedMaterialItems[itemKey] === true) || 
      (modifiedItems[itemKey] !== undefined && initialData.some(item => item.category === category && item.type === type) !== selectedItems.some(item => item.category === category && item.type === type))
    );
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-6 min-h-[500px]">
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
            {getItemsByCategory(selectedCategory).map((item) => {
              const isSelected = selectedItems.some(
                si => si.category === selectedCategory && si.type === item
              );
              const isHighlighted = isItemHighlighted(selectedCategory, item);
              
              return (
                <div key={item} className={`flex items-center space-x-2 p-1 rounded-md ${isHighlighted ? 'bg-yellow-50' : ''}`}>
                  <Checkbox
                    id={item}
                    checked={isSelected}
                    onCheckedChange={() => handleCheckItem(selectedCategory, item)}
                  />
                  <Label
                    htmlFor={item}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item} {isHighlighted && isRevision && <span className="text-xs text-yellow-600">(modified)</span>}
                  </Label>
                </div>
              );
            })}
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
              
              {openCategory === category && items.map((item, itemIndex) => {
                const itemKey = `${item.category}-${item.type}`;
                const isHighlighted = isRevision && (changedMaterialItems[itemKey] === true || modifiedItems[itemKey] !== undefined);
                
                return (
                  <div 
                    key={`${item.category}-${item.type}-${itemIndex}`} 
                    className={`border-t ${isHighlighted ? 'bg-yellow-50' : ''}`}
                  >
                    <div className="px-6 py-4 bg-gray-50">
                      <h4 className="text-lg font-medium text-gray-700">
                        {item.type} in {category}
                        {isHighlighted && <span className="ml-2 text-xs text-yellow-600">(modified)</span>}
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
                        
                        // Track modification in revision mode
                        if (isRevision) {
                          setModifiedItems(prev => ({
                            ...prev,
                            [itemKey]: true
                          }));
                        }
                      }}
                      onUpdateSpecifications={(specs) => {
                        console.log("Updating specifications for", item.type, ":", specs);
                        const updatedItems = [...selectedItems];
                        const index = updatedItems.findIndex(
                          i => i.category === item.category && i.type === item.type
                        );
                        updatedItems[index] = { 
                          ...updatedItems[index], 
                          specifications: specs 
                        };
                        setSelectedItems(updatedItems);
                        
                        // Track modification in revision mode
                        if (isRevision) {
                          setModifiedItems(prev => ({
                            ...prev,
                            [itemKey]: true
                          }));
                        }
                      }}
                    />
                  </div>
                );
              })}
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-6 border-t">
        <Button onClick={handleSave}>
          {isRevision ? "Save Revised Material Requirements" : "Save Material Requirements"}
        </Button>
      </div>
    </div>
  );
}
