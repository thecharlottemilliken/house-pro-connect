
import React from 'react';
import { Copy, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkAreaTableHeader } from "./components/WorkAreaTableHeader";
import { WorkAreaTableRow } from "./components/WorkAreaTableRow";
import { WorkAreaRevisionProps } from './components/RevisionAwareFormProps';

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
}

interface WorkAreaTableProps extends WorkAreaRevisionProps {
  workAreas: WorkArea[];
  onEdit: (area: WorkArea, index: number) => void;
  onDuplicate: (area: WorkArea) => void;
  onDelete: (index: number) => void;
}

export function WorkAreaTable({ 
  workAreas, 
  onEdit, 
  onDuplicate, 
  onDelete,
  isRevision = false,
  changedWorkAreas = {}
}: WorkAreaTableProps) {
  return (
    <div className="border rounded-md">
      <table className="w-full">
        <WorkAreaTableHeader />
        <tbody>
          {workAreas.map((area, index) => {
            const isChanged = isRevision && changedWorkAreas[index.toString()] === true;
            
            return (
              <WorkAreaTableRow
                key={`${area.name}-${index}`}
                area={area}
                isHighlighted={isChanged}
                actions={
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(area, index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(area)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
