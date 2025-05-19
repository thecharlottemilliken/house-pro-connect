
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkArea {
  name: string;
  notes: string;
  measurements: {
    length: string;
    width: string;
    height: string;
    totalSqft: string;
  };
  affectsOtherAreas: boolean;
  additionalAreas: Array<{
    name: string;
    notes: string;
  }>;
  type?: 'interior' | 'exterior';
}

interface WorkAreaTableRowProps {
  area: WorkArea;
  index: number;
  onEdit: (area: WorkArea, index: number) => void;
  onDuplicate: (area: WorkArea) => void;
  onDelete: (index: number) => void;
}

export function WorkAreaTableRow({ 
  area, 
  index, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: WorkAreaTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="w-[80px]">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onDuplicate(area)}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Duplicate</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(area, index)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive/70 hover:text-destructive"
            onClick={() => onDelete(index)}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{area.name}</div>
        {area.type && (
          <Badge variant="outline" className="mt-1 text-xs capitalize">
            {area.type}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {area.measurements.totalSqft} SQFT
      </TableCell>
      <TableCell className="text-muted-foreground">
        {area.measurements.width}″ × {area.measurements.length}″ × {area.measurements.height}″
      </TableCell>
      <TableCell>
        {area.additionalAreas.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {area.additionalAreas.map((affected, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {affected.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm italic">None</span>
        )}
      </TableCell>
    </TableRow>
  );
}
