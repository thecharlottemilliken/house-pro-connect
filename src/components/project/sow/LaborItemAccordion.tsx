
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRightFromLine } from "lucide-react";

interface LaborItemAccordionProps {
  category: string;
  itemCount: number;
  isOpen: boolean;
  onToggle: () => void;
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
}

export function LaborItemAccordion({
  workAreas,
  selectedRooms,
  onUpdateRooms,
}: LaborItemAccordionProps) {
  const handleAreaToggle = (areaName: string, checked: boolean) => {
    if (checked) {
      // Add new area if not already selected
      if (!selectedRooms.find(room => room.name === areaName)) {
        onUpdateRooms([...selectedRooms, { 
          name: areaName, 
          notes: "",
          affectedAreas: [] 
        }]);
      }
    } else {
      // Remove area if unchecked
      onUpdateRooms(selectedRooms.filter(room => room.name !== areaName));
    }
  };

  const handleAffectedAreaToggle = (roomName: string, affectedAreaName: string, checked: boolean) => {
    const updatedRooms = selectedRooms.map(room => {
      if (room.name === roomName) {
        const currentAffectedAreas = room.affectedAreas || [];
        if (checked) {
          // Add affected area if not already present
          if (!currentAffectedAreas.some(area => area.name === affectedAreaName)) {
            return {
              ...room,
              affectedAreas: [...currentAffectedAreas, { name: affectedAreaName, notes: "" }]
            };
          }
        } else {
          // Remove affected area
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
