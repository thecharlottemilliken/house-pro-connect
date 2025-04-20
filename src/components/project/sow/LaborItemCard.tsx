
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LaborItemCardProps {
  item: {
    category: string;
    name: string;
    affectedAreas: string[];
    notes: Record<string, string>;
  };
  workAreas: { name: string }[];
  onRemove: () => void;
  onAreaChange: (areas: string[]) => void;
  onNotesChange: (area: string, notes: string) => void;
}

export function LaborItemCard({ item, workAreas, onRemove, onAreaChange, onNotesChange }: LaborItemCardProps) {
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
          <div>
            <Label>Affected Areas</Label>
            <Select
              defaultValue={item.affectedAreas.join(",")}
              onValueChange={(value) => onAreaChange(value.split(",").filter(Boolean))}
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
          </div>

          {item.affectedAreas.map(area => (
            <div key={area} className="space-y-2">
              <Label>{area} Notes</Label>
              <Textarea
                placeholder={`Enter notes for ${item.name} in ${area}...`}
                value={item.notes[area] || ""}
                onChange={(e) => onNotesChange(area, e.target.value)}
              />
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
