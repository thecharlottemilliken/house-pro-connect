import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRightFromLine, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MaterialItemAccordionProps {
  category: string;
  materialType: string;
  workAreas: any[];
  selectedRooms: Array<{ 
    name: string;
    notes: string;
    affectedAreas?: Array<{
      name: string;
      notes: string;
    }>;
    specifications?: any; // Add specifications property to the room type
  }>;
  onUpdateRooms: (rooms: Array<{ 
    name: string;
    notes: string;
    affectedAreas?: Array<{
      name: string;
      notes: string;
    }>;
    specifications?: any; // Add specifications property to the room type
  }>) => void;
  onUpdateSpecifications: (specifications: any) => void;
}

interface CabinetSpecification {
  id: string;
  type: string;
  doors: number;
  drawers: number;
  size: string;
}

interface FlooringSpecification {
  materialType: string;
  squareFootage: number;
  color: string;
  brand: string;
  status: string;
}

interface PlumbingSpecification {
  manufacturer: string;
  model: string;
  finish: string;
  quantity: number;
  status: string;
}

interface CountertopSpecification {
  material: string;
  squareFootage: number;
  thickness: string;
  edgeProfile: string;
  color: string;
  status: string;
}

interface ApplianceSpecification {
  brand: string;
  model: string;
  color: string;
  size: string;
  quantity: number;
  status: string;
}

export function MaterialItemAccordion({
  category,
  materialType,
  workAreas,
  selectedRooms,
  onUpdateRooms,
  onUpdateSpecifications
}: MaterialItemAccordionProps) {
  const handleAreaToggle = (areaName: string, checked: boolean) => {
    if (checked) {
      if (!selectedRooms.find(room => room.name === areaName)) {
        onUpdateRooms([...selectedRooms, { 
          name: areaName, 
          notes: "",
          affectedAreas: [] 
        }]);
      }
    } else {
      onUpdateRooms(selectedRooms.filter(room => room.name !== areaName));
    }
  };

  const handleAffectedAreaToggle = (roomName: string, affectedAreaName: string, checked: boolean) => {
    const updatedRooms = selectedRooms.map(room => {
      if (room.name === roomName) {
        const currentAffectedAreas = room.affectedAreas || [];
        if (checked) {
          if (!currentAffectedAreas.some(area => area.name === affectedAreaName)) {
            return {
              ...room,
              affectedAreas: [...currentAffectedAreas, { name: affectedAreaName, notes: "" }]
            };
          }
        } else {
          return {
            ...room,
            affectedAreas: currentAffectedAreas.filter(area => area.name !== affectedAreaName)
          };
        }
      }
      return room;
    });
    onUpdateRooms(updatedRooms);
  };

  const renderSpecificationsForm = () => {
    const specifications = selectedRooms[0]?.specifications || {};

    switch (materialType) {
      case "Cabinets":
        return (
          <div className="space-y-6 mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-4">Cabinet Specifications</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cabinet Type</TableHead>
                  <TableHead>Doors</TableHead>
                  <TableHead>Drawers</TableHead>
                  <TableHead>Size (L x W x D)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specifications.cabinets?.map((cabinet: CabinetSpecification, index: number) => (
                  <TableRow key={cabinet.id}>
                    <TableCell>
                      <Input
                        value={cabinet.type}
                        onChange={(e) => {
                          const updatedCabinets = [...(specifications.cabinets || [])];
                          updatedCabinets[index] = { ...cabinet, type: e.target.value };
                          onUpdateSpecifications({ ...specifications, cabinets: updatedCabinets });
                        }}
                        placeholder="Wall, Base, etc."
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={cabinet.doors}
                        onChange={(e) => {
                          const updatedCabinets = [...(specifications.cabinets || [])];
                          updatedCabinets[index] = { ...cabinet, doors: parseInt(e.target.value) };
                          onUpdateSpecifications({ ...specifications, cabinets: updatedCabinets });
                        }}
                        placeholder="Number of doors"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={cabinet.drawers}
                        onChange={(e) => {
                          const updatedCabinets = [...(specifications.cabinets || [])];
                          updatedCabinets[index] = { ...cabinet, drawers: parseInt(e.target.value) };
                          onUpdateSpecifications({ ...specifications, cabinets: updatedCabinets });
                        }}
                        placeholder="Number of drawers"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={cabinet.size}
                        onChange={(e) => {
                          const updatedCabinets = [...(specifications.cabinets || [])];
                          updatedCabinets[index] = { ...cabinet, size: e.target.value };
                          onUpdateSpecifications({ ...specifications, cabinets: updatedCabinets });
                        }}
                        placeholder="12x12x12"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedCabinets = specifications.cabinets?.filter((_, i) => i !== index);
                          onUpdateSpecifications({ ...specifications, cabinets: updatedCabinets });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={() => {
                const newCabinet = {
                  id: Math.random().toString(36).substr(2, 9),
                  type: "",
                  doors: 0,
                  drawers: 0,
                  size: ""
                };
                onUpdateSpecifications({
                  ...specifications,
                  cabinets: [...(specifications.cabinets || []), newCabinet]
                });
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Cabinet
            </Button>
          </div>
        );

      case "Flooring":
        return (
          <div className="space-y-6 mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-4">Flooring Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Material Type</Label>
                <Select
                  value={specifications.materialType}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, materialType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardwood">Hardwood</SelectItem>
                    <SelectItem value="tile">Tile</SelectItem>
                    <SelectItem value="laminate">Laminate</SelectItem>
                    <SelectItem value="vinyl">Vinyl</SelectItem>
                    <SelectItem value="carpet">Carpet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Square Footage</Label>
                <Input
                  type="number"
                  value={specifications.squareFootage}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    squareFootage: parseFloat(e.target.value) 
                  })}
                  placeholder="Enter square footage"
                />
              </div>

              <div>
                <Label>Color/Pattern</Label>
                <Input
                  value={specifications.color}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    color: e.target.value 
                  })}
                  placeholder="Enter color or pattern"
                />
              </div>

              <div>
                <Label>Brand</Label>
                <Input
                  value={specifications.brand}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    brand: e.target.value 
                  })}
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={specifications.status}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="needed">Needed</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "Countertops":
        return (
          <div className="space-y-6 mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-4">Countertop Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Material</Label>
                <Select
                  value={specifications.material}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, material: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="granite">Granite</SelectItem>
                    <SelectItem value="quartz">Quartz</SelectItem>
                    <SelectItem value="marble">Marble</SelectItem>
                    <SelectItem value="butcher-block">Butcher Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Square Footage</Label>
                <Input
                  type="number"
                  value={specifications.squareFootage}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    squareFootage: parseFloat(e.target.value) 
                  })}
                  placeholder="Enter square footage"
                />
              </div>

              <div>
                <Label>Thickness</Label>
                <Select
                  value={specifications.thickness}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, thickness: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select thickness" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2cm">2cm</SelectItem>
                    <SelectItem value="3cm">3cm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Edge Profile</Label>
                <Select
                  value={specifications.edgeProfile}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, edgeProfile: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select edge profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="beveled">Beveled</SelectItem>
                    <SelectItem value="bullnose">Bullnose</SelectItem>
                    <SelectItem value="ogee">Ogee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Color</Label>
                <Input
                  value={specifications.color}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    color: e.target.value 
                  })}
                  placeholder="Enter color name"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={specifications.status}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="needed">Needed</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "Appliances":
        return (
          <div className="space-y-6 mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-4">Appliance Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Brand</Label>
                <Input
                  value={specifications.brand}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    brand: e.target.value 
                  })}
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <Label>Model</Label>
                <Input
                  value={specifications.model}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    model: e.target.value 
                  })}
                  placeholder="Enter model number"
                />
              </div>

              <div>
                <Label>Color</Label>
                <Select
                  value={specifications.color}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="panel-ready">Panel Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Size</Label>
                <Input
                  value={specifications.size}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    size: e.target.value 
                  })}
                  placeholder="Enter dimensions"
                />
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={specifications.quantity}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    quantity: parseInt(e.target.value) 
                  })}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={specifications.status}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="needed">Needed</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "Faucets":
      case "Sinks":
      case "Toilets":
      case "Showers":
        return (
          <div className="space-y-6 mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-4">Plumbing Fixture Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Manufacturer</Label>
                <Input
                  value={specifications.manufacturer}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    manufacturer: e.target.value 
                  })}
                  placeholder="Enter manufacturer"
                />
              </div>

              <div>
                <Label>Model</Label>
                <Input
                  value={specifications.model}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    model: e.target.value 
                  })}
                  placeholder="Enter model number"
                />
              </div>

              <div>
                <Label>Finish</Label>
                <Select
                  value={specifications.finish}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, finish: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select finish" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chrome">Chrome</SelectItem>
                    <SelectItem value="brushed-nickel">Brushed Nickel</SelectItem>
                    <SelectItem value="oil-rubbed-bronze">Oil Rubbed Bronze</SelectItem>
                    <SelectItem value="matte-black">Matte Black</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={specifications.quantity}
                  onChange={(e) => onUpdateSpecifications({ 
                    ...specifications, 
                    quantity: parseInt(e.target.value) 
                  })}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={specifications.status}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="needed">Needed</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-6 pb-6 space-y-4 border-t">
      <div className="pt-4">
        <h4 className="text-sm font-medium mb-4">Affected Areas</h4>
        <div className="space-y-4">
          {workAreas.map((area: any) => (
            <div key={area.name} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`area-${area.name}`}
                  checked={selectedRooms.some(room => room.name === area.name)}
                  onCheckedChange={(checked) => handleAreaToggle(area.name, checked as boolean)}
                />
                <Label htmlFor={`area-${area.name}`}>{area.name}</Label>
              </div>
              
              {selectedRooms.some(room => room.name === area.name) && area.additionalAreas && area.additionalAreas.length > 0 && (
                <div className="ml-6 space-y-2">
                  {area.additionalAreas.map((affectedArea: any) => (
                    <div key={affectedArea.name} className="flex items-center space-x-2">
                      <ArrowRightFromLine className="h-4 w-4 text-muted-foreground" />
                      <Checkbox
                        id={`affected-${area.name}-${affectedArea.name}`}
                        checked={selectedRooms
                          .find(room => room.name === area.name)
                          ?.affectedAreas?.some(a => a.name === affectedArea.name) ?? false}
                        onCheckedChange={(checked) => 
                          handleAffectedAreaToggle(area.name, affectedArea.name, checked as boolean)
                        }
                      />
                      <Label htmlFor={`affected-${area.name}-${affectedArea.name}`}>
                        {affectedArea.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {renderSpecificationsForm()}

      {selectedRooms.map((room) => (
        <div key={room.name} className="space-y-2">
          <h4 className="text-sm font-medium">{room.name} Notes</h4>
          <Textarea
            placeholder={`Notes for ${room.name}`}
            value={room.notes}
            onChange={(e) => {
              const updatedRooms = selectedRooms.map(r => {
                if (r.name === room.name) {
                  return { ...r, notes: e.target.value };
                }
                return r;
              });
              onUpdateRooms(updatedRooms);
            }}
          />
          
          {room.affectedAreas && room.affectedAreas.length > 0 && (
            <div className="space-y-2 mt-4">
              <h5 className="text-sm font-medium text-muted-foreground">Connected Area Notes</h5>
              {room.affectedAreas.map((affectedArea) => (
                <div key={affectedArea.name} className="space-y-1">
                  <Label className="text-sm text-muted-foreground">{affectedArea.name}</Label>
                  <Textarea
                    placeholder={`Notes for ${affectedArea.name}`}
                    value={affectedArea.notes}
                    onChange={(e) => {
                      const updatedRooms = selectedRooms.map(r => {
                        if (r.name === room.name) {
                          return {
                            ...r,
                            affectedAreas: r.affectedAreas?.map(a => {
                              if (a.name === affectedArea.name) {
                                return { ...a, notes: e.target.value };
                              }
                              return a;
                            })
                          };
                        }
                        return r;
                      });
                      onUpdateRooms(updatedRooms);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
