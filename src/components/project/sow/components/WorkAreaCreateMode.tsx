
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Bookmark } from "lucide-react";

interface WorkAreaCreateModeProps {
  mode: 'new' | 'existing';
  onModeChange: (mode: 'new' | 'existing') => void;
  disableExisting: boolean;
}

export function WorkAreaCreateMode({ mode, onModeChange, disableExisting }: WorkAreaCreateModeProps) {
  return (
    <div className="flex items-center justify-start gap-4 mb-4">
      <Button
        variant={mode === 'new' ? "default" : "outline"}
        onClick={() => onModeChange('new')}
        className="flex-1"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New
      </Button>
      <Button
        variant={mode === 'existing' ? "default" : "outline"}
        onClick={() => onModeChange('existing')}
        className="flex-1"
        disabled={disableExisting}
      >
        <Bookmark className="h-4 w-4 mr-2" />
        Use Existing Room
      </Button>
    </div>
  );
}
