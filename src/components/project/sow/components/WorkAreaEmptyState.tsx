
import React from 'react';
import { Card } from "@/components/ui/card";

export function WorkAreaEmptyState() {
  return (
    <Card className="p-6 flex flex-col items-center justify-center text-center h-40">
      <h3 className="text-lg font-medium text-muted-foreground mb-2">No Work Areas Added</h3>
      <p className="text-sm text-muted-foreground">
        Click "ADD WORK AREA" above to define areas where work will be performed.
      </p>
    </Card>
  );
}
