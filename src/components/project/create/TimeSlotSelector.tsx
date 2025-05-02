
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Pencil } from "lucide-react";
import { format } from "date-fns";
import { TimeSlot, formatTimeSlot } from "@/utils/timeSlotFormatters";

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  onEditTimeSlot: (index: number) => void;
  onClearTimeSlot: (index: number) => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlots,
  onEditTimeSlot,
  onClearTimeSlot,
}) => {
  return (
    <>
      {timeSlots.map((slot, index) => (
        <div key={index} className="mb-4">
          {slot.date && slot.time ? (
            <div className="bg-gray-50 rounded-md p-5 relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onEditTimeSlot(index)}
                >
                  <Pencil className="h-5 w-5 text-gray-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onClearTimeSlot(index)}
                >
                  <X className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
              <h4 className="text-lg font-medium mb-1">Time Slot {index + 1}</h4>
              {(() => {
                const formattedSlot = formatTimeSlot(slot);
                if (typeof formattedSlot === 'string') {
                  return <p className="text-sm text-gray-700">{formattedSlot}</p>;
                } else {
                  return (
                    <>
                      <p className="text-xl font-normal text-gray-800">
                        {formattedSlot.dayAndDate}
                      </p>
                      <p className="text-xl font-normal text-gray-800">
                        {formattedSlot.time}
                      </p>
                    </>
                  );
                }
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-between border border-gray-300 rounded-md p-3">
              <p className="text-sm text-gray-700">
                Select a time and date for your call
              </p>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700"
                onClick={() => onEditTimeSlot(index)}
              >
                MAKE SELECTION
              </Button>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
