
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkAreaCreateMode } from './WorkAreaCreateMode';
import { ExistingRoomSelector } from './ExistingRoomSelector';
import { WorkAreaDetails } from './WorkAreaDetails';
import { WorkAreaMeasurements } from './WorkAreaMeasurements';
import { AffectedAreasSection } from './AffectedAreasSection';

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
  sourceRoomId?: string;
}

interface Room {
  id: string;
  name: string;
}

interface WorkAreaFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentArea: WorkArea;
  setCurrentArea: React.Dispatch<React.SetStateAction<WorkArea>>;
  createMode: 'new' | 'existing';
  setCreateMode: React.Dispatch<React.SetStateAction<'new' | 'existing'>>;
  propertyRooms: Room[];
  handleRoomSelect: (roomId: string) => void;
  handleAddWorkArea: () => void;
  handleAddAdditionalArea: () => void;
}

export function WorkAreaFormDialog({
  isOpen,
  onOpenChange,
  currentArea,
  setCurrentArea,
  createMode,
  setCreateMode,
  propertyRooms,
  handleRoomSelect,
  handleAddWorkArea,
  handleAddAdditionalArea
}: WorkAreaFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Define Work Area</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <WorkAreaCreateMode 
            mode={createMode}
            onModeChange={setCreateMode}
            disableExisting={!propertyRooms.length}
          />
          
          {createMode === 'existing' && (
            <ExistingRoomSelector
              rooms={propertyRooms}
              onRoomSelect={handleRoomSelect}
              hasSelectedRoom={!!currentArea.sourceRoomId}
            />
          )}

          <WorkAreaDetails
            name={currentArea.name}
            notes={currentArea.notes}
            onNameChange={(name) => setCurrentArea({...currentArea, name})}
            onNotesChange={(notes) => setCurrentArea({...currentArea, notes})}
          />

          <WorkAreaMeasurements
            measurements={currentArea.measurements}
            onChange={(measurements) => setCurrentArea({...currentArea, measurements})}
            sourceRoomId={currentArea.sourceRoomId}
          />

          <AffectedAreasSection
            affectsOtherAreas={currentArea.affectsOtherAreas}
            additionalAreas={currentArea.additionalAreas}
            onAffectsOtherAreasChange={(checked) => 
              setCurrentArea({...currentArea, affectsOtherAreas: checked})
            }
            onAdditionalAreasChange={(areas) => 
              setCurrentArea({...currentArea, additionalAreas: areas})
            }
            onAddAdditionalArea={handleAddAdditionalArea}
          />
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWorkArea}>
              Add Work Area
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
