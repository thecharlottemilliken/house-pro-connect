
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Plus } from "lucide-react";

interface EmptyWorkAreaStateProps {
  colSpan: number;
  onAddNew?: () => void;
}

export function EmptyWorkAreaState({ colSpan, onAddNew }: EmptyWorkAreaStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
          <div className="rounded-full bg-muted p-2.5">
            <Plus className="h-5 w-5" />
          </div>
          <div className="font-medium">No work areas</div>
          <div className="text-sm">
            {onAddNew ? (
              <button 
                onClick={onAddNew}
                className="text-primary underline hover:text-primary/80"
              >
                Add your first work area
              </button>
            ) : (
              "No work areas have been added yet"
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
