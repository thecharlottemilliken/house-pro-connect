
import React from 'react';
import { Button } from "@/components/ui/button";

interface WorkAreaFormControlsProps {
  onBack: () => void;
  onSave: () => void;
}

export function WorkAreaFormControls({ onBack, onSave }: WorkAreaFormControlsProps) {
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={onBack}
      >
        BACK
      </Button>
      <div className="space-x-4">
        <Button
          variant="outline"
          onClick={onSave}
        >
          SAVE & EXIT
        </Button>
        <Button
          onClick={onSave}
        >
          NEXT
        </Button>
      </div>
    </div>
  );
}
