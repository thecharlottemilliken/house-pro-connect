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
    switch (materialType) {
      case "Cabinets":
        const specifications = selectedRooms[0]?.specifications || {};

        return (
          <div className="space-y-6 mt-4 p-4 bg-gray-50 rounded-md">
            <div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div>
                <Label>Preferred Color</Label>
                <Select
                  value={specifications.preferredColor}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, preferredColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navy">Navy</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferred Brand</Label>
                <Select
                  value={specifications.preferredBrand}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, preferredBrand: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kraftmaid">KraftMaid</SelectItem>
                    <SelectItem value="merillat">Merillat</SelectItem>
                    <SelectItem value="american-woodmark">American Woodmark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Box Construction</Label>
                <Select
                  value={specifications.boxConstruction}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, boxConstruction: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select construction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plywood">Plywood</SelectItem>
                    <SelectItem value="particleboard">Particleboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Front Style</Label>
                <Select
                  value={specifications.frontStyle}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, frontStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raised-panel">Raised Panel</SelectItem>
                    <SelectItem value="shaker">Shaker</SelectItem>
                    <SelectItem value="flat-panel">Flat Panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Wood Type</Label>
                <Select
                  value={specifications.woodType}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, woodType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select wood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cherry">Cherry</SelectItem>
                    <SelectItem value="maple">Maple</SelectItem>
                    <SelectItem value="oak">Oak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Box Thickness</Label>
                <Select
                  value={specifications.boxThickness}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, boxThickness: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select thickness" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4"</SelectItem>
                    <SelectItem value="3">3"</SelectItem>
                    <SelectItem value="2">2"</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Box Material</Label>
                <Select
                  value={specifications.boxMaterial}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, boxMaterial: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plywood">Plywood</SelectItem>
                    <SelectItem value="mdf">MDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Box Type</Label>
                <Select
                  value={specifications.boxType}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, boxType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select box type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="framed">Framed</SelectItem>
                    <SelectItem value="frameless">Frameless</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Frame Type</Label>
                <Select
                  value={specifications.frameType}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, frameType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frame type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partial-overlay">Partial Overlay</SelectItem>
                    <SelectItem value="full-overlay">Full Overlay</SelectItem>
                    <SelectItem value="inset">Inset</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Door Hinge Type</Label>
                <Select
                  value={specifications.doorHingeType}
                  onValueChange={(value) => onUpdateSpecifications({ ...specifications, doorHingeType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hinge type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concealed">Concealed</SelectItem>
                    <SelectItem value="exposed">Exposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      // Add more cases for other material types
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
