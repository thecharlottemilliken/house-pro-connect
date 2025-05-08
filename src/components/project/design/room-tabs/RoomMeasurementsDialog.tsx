
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RoomMeasurementsCard from '../RoomMeasurementsCard';

interface RoomMeasurementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: string;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  onSaveMeasurements: (measurements: any) => void;
}

const RoomMeasurementsDialog: React.FC<RoomMeasurementsDialogProps> = ({
  open,
  onOpenChange,
  area,
  measurements,
  onSaveMeasurements
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Measure Your Room</h2>
          <RoomMeasurementsCard 
            area={area}
            measurements={measurements || { unit: 'ft' }}
            onSaveMeasurements={(newMeasurements) => {
              onSaveMeasurements(newMeasurements);
              onOpenChange(false);
            }}
            initialEditMode={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomMeasurementsDialog;
