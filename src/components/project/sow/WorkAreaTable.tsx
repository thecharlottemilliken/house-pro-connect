
import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, FileText } from "lucide-react";

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

interface WorkAreaTableProps {
  workAreas: WorkArea[];
}

export function WorkAreaTable({ workAreas }: WorkAreaTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#1b3a4b] hover:bg-[#1b3a4b]">
            <TableHead className="w-[50px] text-white"></TableHead>
            <TableHead className="text-white">Primary Area</TableHead>
            <TableHead className="text-white">Primary SQFT</TableHead>
            <TableHead className="text-white">Primary WxDxL</TableHead>
            <TableHead className="text-white">Affected Areas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workAreas.map((area, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{area.name}</TableCell>
              <TableCell>{area.measurements.totalSqft} SQFT</TableCell>
              <TableCell>
                {area.measurements.width} x {area.measurements.length} x {area.measurements.height}
              </TableCell>
              <TableCell>
                {area.additionalAreas.map(affected => affected.name).join(", ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
