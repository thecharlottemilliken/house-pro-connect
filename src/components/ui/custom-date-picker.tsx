
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";

interface CustomDatePickerProps {
  onSelect: (date: Date) => void;
  selectedDate: Date | null;
}

export const CustomDatePicker = ({ onSelect, selectedDate }: CustomDatePickerProps) => {
  // Get tomorrow's date as the starting date
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(getTomorrow());
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  // Generate 7 days starting from currentWeekStart
  useEffect(() => {
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      return date;
    });
    setVisibleDates(dates);
    
    // Get month from first visible date
    setCurrentMonth(format(dates[0], "MMMM"));
    
    // Check if the dates span across two months
    const lastDateMonth = format(dates[dates.length - 1], "MMMM");
    if (lastDateMonth !== format(dates[0], "MMMM")) {
      setCurrentMonth(`${format(dates[0], "MMMM")}/${lastDateMonth}`);
    }
  }, [currentWeekStart]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    
    // Don't go before tomorrow
    const tomorrow = getTomorrow();
    if (newStart < tomorrow) {
      setCurrentWeekStart(tomorrow);
    } else {
      setCurrentWeekStart(newStart);
    }
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    
    // Don't go beyond 4 weeks from tomorrow
    const tomorrow = getTomorrow();
    const fourWeeksLater = new Date(tomorrow);
    fourWeeksLater.setDate(tomorrow.getDate() + 28 - 7); // Max start date (to show last 7 days)
    
    if (newStart > fourWeeksLater) {
      setCurrentWeekStart(fourWeeksLater);
    } else {
      setCurrentWeekStart(newStart);
    }
  };

  // Get day number (1-31)
  const getDay = (date: Date) => {
    return format(date, "dd");
  };

  // Get day name (Sun, Mon, etc.)
  const getDayName = (date: Date) => {
    return format(date, "EEE");
  };

  // Check if date is selectable (within the 4-week range)
  const isSelectable = (date: Date) => {
    const tomorrow = getTomorrow();
    const fourWeeksLater = new Date(tomorrow);
    fourWeeksLater.setDate(tomorrow.getDate() + 28);
    
    return date >= tomorrow && date <= fourWeeksLater;
  };

  // Check if we can navigate to previous week
  const canGoToPreviousWeek = () => {
    const tomorrow = getTomorrow();
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    return previousWeekStart >= tomorrow;
  };

  // Check if we can navigate to next week
  const canGoToNextWeek = () => {
    const tomorrow = getTomorrow();
    const fourWeeksLater = new Date(tomorrow);
    fourWeeksLater.setDate(tomorrow.getDate() + 28 - 7); // Max start date
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(currentWeekStart.getDate() + 7);
    
    return nextWeekStart <= fourWeeksLater;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center justify-between w-full mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousWeek}
          disabled={!canGoToPreviousWeek()}
          className="text-gray-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="text-base font-medium text-center">{currentMonth}</div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextWeek}
          disabled={!canGoToNextWeek()}
          className="text-gray-500"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex w-full justify-between gap-2 overflow-x-auto pb-2">
        {visibleDates.map((date) => (
          <Button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelect(date)}
            className={`flex-1 min-w-[70px] h-24 flex flex-col items-center justify-center rounded-md transition-colors
              ${isSameDay(date, selectedDate ?? new Date(0)) 
                ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" 
                : "bg-transparent border border-gray-300 hover:bg-gray-100"
              }
              ${!isSelectable(date) ? "opacity-50 cursor-not-allowed" : ""}
            `}
            disabled={!isSelectable(date)}
          >
            <span className={`text-2xl font-medium ${isSameDay(date, selectedDate ?? new Date(0)) ? "text-white" : "text-[#174c65]"}`}>
              {getDay(date)}
            </span>
            <span className={`text-sm ${isSameDay(date, selectedDate ?? new Date(0)) ? "text-white" : "text-gray-500"}`}>
              {getDayName(date)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
