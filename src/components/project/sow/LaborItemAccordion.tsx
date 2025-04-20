
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LaborItemAccordionProps {
  category: string;
  itemCount: number;
  isOpen: boolean;
  onToggle: () => void;
  workAreas: any[];
  selectedRooms: Array<{ name: string; notes: string }>;
  onUpdateRooms: (rooms: Array<{ name: string; notes: string }>) => void;
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
        onUpdateRooms([...selectedRooms, { name: areaName, notes: "" }]);
      }
    } else {
      // Remove area if unchecked
      onUpdateRooms(selectedRooms.filter(room => room.name !== areaName));
    }
  };

  return (
    <div className="px-6 pb-6 space-y-4 border-t">
      <div className="pt-4">
        <h4 className="text-sm font-medium mb-4">Affected Areas</h4>
        <div className="space-y-2">
          {workAreas.map((area: any) => (
            <div key={area.name} className="flex items-center space-x-2">
              <Checkbox
                id={`area-${area.name}`}
                checked={selectedRooms.some(room => room.name === area.name)}
                onCheckedChange={(checked) => handleAreaToggle(area.name, checked as boolean)}
              />
              <Label htmlFor={`area-${area.name}`}>{area.name}</Label>
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
        </div>
      ))}
    </div>
  );
}
