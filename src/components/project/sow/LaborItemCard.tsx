
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LaborItem, WorkArea } from "./types";

interface LaborItemCardProps {
  item: LaborItem;
  workAreas: WorkArea[];
  onRemove: () => void;
  onAddArea: () => void;
  onAreaChange: (index: number, room: string) => void;
  onNotesChange: (index: number, notes: string) => void;
  onSqftChange: (index: number, sqft: string) => void;
}

export function LaborItemCard({
  item,
  workAreas,
  onRemove,
  onAddArea,
  onAreaChange,
  onNotesChange,
  onSqftChange,
}: LaborItemCardProps) {
  return (
    <AccordionItem value={item.name} className="border rounded-lg mb-4 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-white">
        <div>
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-muted-foreground">{item.category}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {item.affectedAreas.map((area, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-md">
              <div>
                <Label>Room</Label>
                <Select
                  value={area.room}
                  onValueChange={(value) => onAreaChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {workAreas.map(area => (
                      <SelectItem key={area.name} value={area.name}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Square Footage</Label>
                <Input
                  type="text"
                  placeholder="Enter square footage"
                  value={area.sqft}
                  onChange={(e) => onSqftChange(index, e.target.value)}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder={`Enter notes for ${item.name} in ${area.room}...`}
                  value={area.notes}
                  onChange={(e) => onNotesChange(index, e.target.value)}
                />
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onAddArea}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Room
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
