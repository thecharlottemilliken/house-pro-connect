
import React from 'react';
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export function WorkAreaTableHeader() {
  return (
    <TableHeader>
      <TableRow className="bg-[#1b3a4b] hover:bg-[#1b3a4b]">
        <TableHead className="w-[80px] text-white"></TableHead>
        <TableHead className="text-white">Primary Area</TableHead>
        <TableHead className="text-white">Primary SQFT</TableHead>
        <TableHead className="text-white">Primary WxLxH</TableHead>
        <TableHead className="text-white">Affected Areas</TableHead>
      </TableRow>
    </TableHeader>
  );
}
