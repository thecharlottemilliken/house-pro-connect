
import React from 'react';
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { WorkAreaTableHeader } from "./components/WorkAreaTableHeader";
import { WorkAreaTableRow } from "./components/WorkAreaTableRow";
import { EmptyWorkAreaState } from "./components/EmptyWorkAreaState";

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

interface WorkAreaTableProps {
  workAreas: WorkArea[];
  onEdit: (area: WorkArea, index: number) => void;
  onDuplicate: (area: WorkArea) => void;
  onDelete: (index: number) => void;
  onAddNew?: () => void;
}

export function WorkAreaTable({ 
  workAreas, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onAddNew
}: WorkAreaTableProps) {
  return (
    <Card className="border rounded-md shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <WorkAreaTableHeader />
          <TableBody>
            {workAreas.length > 0 ? (
              workAreas.map((area, index) => (
                <WorkAreaTableRow
                  key={index}
                  area={area}
                  index={index}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <EmptyWorkAreaState colSpan={5} onAddNew={onAddNew} />
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
