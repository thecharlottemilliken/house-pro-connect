
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRightFromLine, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  }>;
  onUpdateRooms: (rooms: Array<{ 
    name: string;
    notes: string;
    affectedAreas?: Array<{
      name: string;
      notes: string;
    }>;
  }>) => void;
  onUpdateSpecifications: (specifications: any) => void;
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
        return (
          <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium">Cabinet Specifications</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Cabinet Type</Label>
                <Input placeholder="Wall, Base, etc." />
              </div>
              <div>
                <Label>Doors</Label>
                <Input type="number" placeholder="Number of doors" />
              </div>
              <div>
                <Label>Drawers</Label>
                <Input type="number" placeholder="Number of drawers" />
              </div>
              <div>
                <Label>Size (L x W x D)</Label>
                <Input placeholder="12x12x12" />
              </div>
            </div>
            <Button type="button" size="sm" className="mt-2">
              <Plus className="w-4 h-4 mr-1" /> Add Cabinet
            </Button>
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
