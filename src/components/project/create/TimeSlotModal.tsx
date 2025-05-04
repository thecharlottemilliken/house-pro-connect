
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTimeSlot: (timeSlot: { date: Date | null; time: string; ampm: "AM" | "PM" }) => void;
}

export const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  onAddTimeSlot,
}) => {
  // Local state for the new time slot
  const [tempTimeSlot, setTempTimeSlot] = useState<{
    date: Date | null;
    time: string;
    ampm: "AM" | "PM";
  }>({
    date: null,
    time: "",
    ampm: "AM"
  });

  // Time range options for the dialog
  const timeRanges = [
    { value: "8:00 - 9:00", label: "8:00 - 9:00" },
    { value: "9:00 - 10:00", label: "9:00 - 10:00" },
    { value: "10:00 - 11:00", label: "10:00 - 11:00" },
    { value: "11:00 - 12:00", label: "11:00 - 12:00" },
    { value: "12:00 - 1:00", label: "12:00 - 1:00" },
    { value: "1:00 - 2:00", label: "1:00 - 2:00" },
    { value: "2:00 - 3:00", label: "2:00 - 3:00" },
    { value: "3:00 - 4:00", label: "3:00 - 4:00" },
    { value: "4:00 - 5:00", label: "4:00 - 5:00" },
  ];

  // Handle save
  const handleSave = () => {
    onAddTimeSlot(tempTimeSlot);
    // Reset the temp slot
    setTempTimeSlot({
      date: null,
      time: "",
      ampm: "AM"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Select a Date and Time Range for a Coach to Reach Out
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Date Selection</h3>
            <p className="text-xs text-gray-500">
              Please pick a day when you'd like to talk to us - this is going to be the date we'll try to contact you within, and you'll receive a calendar invite once a time is ready.
            </p>
          </div>
          
          <div className="flex flex-col items-center w-full">
            <CustomDatePicker
              onSelect={(date) => setTempTimeSlot({...tempTimeSlot, date})}
              selectedDate={tempTimeSlot.date}
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">AM Times</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeRanges.slice(0, 4).map((range) => (
                <Button
                  key={range.value}
                  type="button"
                  variant={tempTimeSlot.time === range.value && tempTimeSlot.ampm === "AM" ? "default" : "outline"}
                  className={cn(
                    tempTimeSlot.time === range.value && tempTimeSlot.ampm === "AM" 
                      ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" 
                      : "border-gray-300"
                  )}
                  onClick={() => setTempTimeSlot({...tempTimeSlot, time: range.value, ampm: "AM"})}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">PM Times</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeRanges.slice(4).map((range) => (
                <Button
                  key={range.value}
                  type="button"
                  variant={tempTimeSlot.time === range.value && tempTimeSlot.ampm === "PM" ? "default" : "outline"}
                  className={cn(
                    tempTimeSlot.time === range.value && tempTimeSlot.ampm === "PM" 
                      ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" 
                      : "border-gray-300"
                  )}
                  onClick={() => setTempTimeSlot({...tempTimeSlot, time: range.value, ampm: "PM"})}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>CANCEL</Button>
          <Button 
            onClick={handleSave}
            className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
            disabled={!tempTimeSlot.date || !tempTimeSlot.time}
          >
            SAVE AS COMPLETE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
