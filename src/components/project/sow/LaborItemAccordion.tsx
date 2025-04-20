
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  category,
  itemCount,
  isOpen,
  onToggle,
  workAreas,
  selectedRooms,
  onUpdateRooms,
}: LaborItemAccordionProps) {
  return (
    <Card className="mb-4 overflow-hidden">
      <div 
        className="p-6 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div>
          <h3 className="text-xl font-medium">{category}</h3>
          <p className="text-gray-500">{itemCount} Labor Items</p>
        </div>
        {isOpen ? (
          <ChevronUp className="h-6 w-6 text-gray-400" />
        ) : (
          <ChevronDown className="h-6 w-6 text-gray-400" />
        )}
      </div>
      
      {isOpen && (
        <div className="px-6 pb-6 space-y-4 border-t">
          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Affected Areas</h4>
            <Select
              value={selectedRooms.map(r => r.name).join(", ")}
              onValueChange={(value) => {
                const selectedRoomNames = value.split(", ");
                const updatedRooms = selectedRoomNames.map(name => ({
                  name,
                  notes: selectedRooms.find(r => r.name === name)?.notes || ""
                }));
                onUpdateRooms(updatedRooms);
              }}
            >
              <SelectTrigger className="w-full">
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

          {selectedRooms.map((room) => (
            <div key={room.name} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">{room.name} Notes</h4>
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
      )}
    </Card>
  );
}
