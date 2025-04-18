
import React, { useState, useMemo } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSOW, MaterialItem } from "@/components/project/sow/SOWContext";

// Material categories with subcategories and specific properties
const materialCategories = {
  "Lumber": {
    subcategories: ["Framing Lumber", "Finish Lumber", "Plywood", "OSB", "Trim", "Molding"],
    properties: ["Wood Type", "Dimensions", "Grade", "Treatment"]
  },
  "Drywall & Accessories": {
    subcategories: ["Drywall Sheets", "Joint Compound", "Drywall Tape", "Corner Bead", "Screws", "Texture"],
    properties: ["Thickness", "Size", "Type", "Fire Rating"]
  },
  "Flooring": {
    subcategories: ["Hardwood", "Laminate", "Tile", "Vinyl", "Carpet", "Underlayment"],
    properties: ["Material", "Color", "Size", "Thickness", "Finish", "Style"]
  },
  "Plumbing": {
    subcategories: ["Pipes", "Fittings", "Fixtures", "Faucets", "Sinks", "Toilets", "Shower Systems"],
    properties: ["Material", "Size", "Finish", "Brand", "Model"]
  },
  "Electrical": {
    subcategories: ["Wire", "Outlets", "Switches", "Panels", "Fixtures", "Smart Devices"],
    properties: ["Type", "Amperage", "Voltage", "Color", "Style"]
  },
  "HVAC": {
    subcategories: ["Ductwork", "Vents", "Equipment", "Insulation", "Thermostats"],
    properties: ["Size", "Material", "Rating", "Brand", "Model"]
  },
  "Paint & Finish": {
    subcategories: ["Interior Paint", "Exterior Paint", "Primer", "Stain", "Sealer", "Texture"],
    properties: ["Color", "Finish", "Base", "Brand", "VOC Content"]
  },
  "Cabinets & Counters": {
    subcategories: ["Base Cabinets", "Wall Cabinets", "Countertops", "Hardware", "Shelving"],
    properties: ["Material", "Style", "Finish", "Dimensions", "Edge Profile"]
  },
  "Doors & Windows": {
    subcategories: ["Interior Doors", "Exterior Doors", "Windows", "Door Hardware", "Trim"],
    properties: ["Material", "Style", "Size", "Finish", "Glazing Type"]
  },
  "Insulation": {
    subcategories: ["Batt Insulation", "Rigid Insulation", "Spray Foam", "Vapor Barrier", "House Wrap"],
    properties: ["R-Value", "Thickness", "Width", "Material Type"]
  },
  "Concrete & Masonry": {
    subcategories: ["Concrete", "Mortar", "Brick", "Block", "Stone", "Pavers"],
    properties: ["Type", "Mix Design", "Color", "Size", "Finish"]
  },
  "Roofing": {
    subcategories: ["Shingles", "Metal Roofing", "Underlayment", "Flashing", "Vents"],
    properties: ["Material", "Color", "Weight", "Warranty", "Fire Rating"]
  },
  "Hardware & Fasteners": {
    subcategories: ["Nails", "Screws", "Bolts", "Anchors", "Adhesives", "Brackets"],
    properties: ["Size", "Material", "Finish", "Type", "Head Style"]
  },
  "Appliances": {
    subcategories: ["Refrigerator", "Range/Oven", "Dishwasher", "Microwave", "Washer", "Dryer"],
    properties: ["Brand", "Model", "Color", "Size", "Energy Rating"]
  },
  "Other": {
    subcategories: ["Landscaping", "Safety Equipment", "Cleaning Supplies", "Specialty Items", "Custom Materials"],
    properties: ["Type", "Brand", "Size", "Color"]
  }
};

// Common units for construction materials
const unitOptions = [
  "Each",
  "Linear Feet",
  "Square Feet",
  "Cubic Feet",
  "Linear Yards",
  "Square Yards",
  "Cubic Yards",
  "Gallons",
  "Pounds",
  "Sheets",
  "Boxes",
  "Pallets",
  "Bags",
  "Bundles",
  "Sets",
  "Pairs",
  "Rolls",
  "Cases"
];

const SpecifyMaterials: React.FC = () => {
  const { sowData, addMaterialItem, updateMaterialItem, removeMaterialItem } = useSOW();
  
  const [newMaterial, setNewMaterial] = useState<Partial<MaterialItem>>({
    category: '',
    subcategory: '',
    quantity: 1,
    unit: '',
    details: {},
    notes: ''
  });
  
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const availableSubcategories = useMemo(() => 
    newMaterial.category 
      ? materialCategories[newMaterial.category as keyof typeof materialCategories]?.subcategories || []
      : [],
    [newMaterial.category]
  );

  const availableProperties = useMemo(() => 
    newMaterial.category 
      ? materialCategories[newMaterial.category as keyof typeof materialCategories]?.properties || []
      : [],
    [newMaterial.category]
  );

  const handlePropertyChange = (property: string, value: string) => {
    setNewMaterial(prev => ({
      ...prev,
      details: {
        ...(prev.details || {}),
        [property]: value
      }
    }));
  };

  const handleAddMaterial = () => {
    if (!newMaterial.category || !newMaterial.subcategory || !newMaterial.unit) return;
    
    const materialItem: MaterialItem = {
      id: uuidv4(),
      category: newMaterial.category,
      subcategory: newMaterial.subcategory,
      quantity: newMaterial.quantity || 1,
      unit: newMaterial.unit,
      details: newMaterial.details || {},
      notes: newMaterial.notes || ''
    };
    
    addMaterialItem(materialItem);
    
    // Reset the form
    setNewMaterial({
      category: '',
      subcategory: '',
      quantity: 1,
      unit: '',
      details: {},
      notes: ''
    });
  };

  const toggleItemOpen = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Specify Required Materials</h2>
        <p className="mb-4 text-gray-600">
          Define all materials needed for the project, including quantities, units, 
          and specific details for each material type.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-3">Add Material</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="material-category">Material Category</Label>
            <Select 
              value={newMaterial.category || ''}
              onValueChange={value => setNewMaterial({
                ...newMaterial, 
                category: value, 
                subcategory: '',
                details: {}
              })}
            >
              <SelectTrigger id="material-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(materialCategories).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="material-subcategory">Subcategory</Label>
            <Select 
              value={newMaterial.subcategory || ''}
              onValueChange={value => setNewMaterial({...newMaterial, subcategory: value})}
              disabled={!newMaterial.category}
            >
              <SelectTrigger id="material-subcategory">
                <SelectValue placeholder={!newMaterial.category ? "Select category first" : "Select subcategory"} />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="material-quantity">Quantity</Label>
            <Input
              id="material-quantity"
              type="number"
              min="0"
              step="0.01"
              value={newMaterial.quantity || ''}
              onChange={e => setNewMaterial({...newMaterial, quantity: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <Label htmlFor="material-unit">Unit</Label>
            <Select 
              value={newMaterial.unit || ''}
              onValueChange={value => setNewMaterial({...newMaterial, unit: value})}
            >
              <SelectTrigger id="material-unit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {newMaterial.category && availableProperties.length > 0 && (
          <div className="mb-4">
            <Label className="mb-2 block">Material-Specific Details</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableProperties.map((property) => (
                <div key={property}>
                  <Label htmlFor={`prop-${property}`}>{property}</Label>
                  <Input
                    id={`prop-${property}`}
                    value={newMaterial.details?.[property] || ''}
                    onChange={e => handlePropertyChange(property, e.target.value)}
                    placeholder={property}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <Label htmlFor="material-notes">Notes (optional)</Label>
          <Textarea
            id="material-notes"
            placeholder="Add notes about this material"
            value={newMaterial.notes || ''}
            onChange={e => setNewMaterial({...newMaterial, notes: e.target.value})}
            className="h-24"
          />
        </div>
        
        <Button 
          onClick={handleAddMaterial} 
          className="flex items-center gap-2 bg-[#0f566c]"
          disabled={!newMaterial.category || !newMaterial.subcategory || !newMaterial.unit}
        >
          <Plus className="h-4 w-4" /> Add Material Item
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="font-medium mb-4">Specified Materials</h3>
        
        {sowData.materialItems.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">
            No materials specified yet. Add some using the form above.
          </div>
        )}
        
        <div className="space-y-3">
          {sowData.materialItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <Collapsible 
                open={openItems[item.id]} 
                onOpenChange={() => toggleItemOpen(item.id)}
              >
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.category} - {item.subcategory}</div>
                    <div className="text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMaterialItem(item.id)}
                      className="h-8 w-8 mr-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8">
                        {openItems[item.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {Object.entries(item.details).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium mr-2">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                    
                    {item.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Notes:</h4>
                        <p className="text-sm text-gray-600">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecifyMaterials;
