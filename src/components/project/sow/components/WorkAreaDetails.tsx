
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Square } from "lucide-react";

interface WorkAreaDetailsProps {
  name: string;
  notes: string;
  onNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
}

export function WorkAreaDetails({ name, notes, onNameChange, onNotesChange }: WorkAreaDetailsProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Square className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Work Area Details</h3>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="work-area-name">Work Area Name*</Label>
            <Input
              id="work-area-name"
              placeholder="e.g., Kitchen, Master Bathroom, Living Room"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="work-area-notes">Description & Scope</Label>
            <Textarea
              id="work-area-notes"
              placeholder="Describe the work to be done in this area..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
