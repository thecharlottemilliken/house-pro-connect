
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";

interface CalendarDay {
  day: number;
  name: string;
  month: string;
  fullDate: Date;
}

interface Event {
  id: number;
  title: string;
  date: Date;
  color: string;
}

interface TimeSlot {
  label: string;
  time: number;
}

interface CalendarGridProps {
  days: CalendarDay[];
  timeSlots: TimeSlot[];
  events: Event[];
  viewMode: "Day" | "Week" | "Month";
}

const CalendarGrid = ({ days, timeSlots, events, viewMode }: CalendarGridProps) => {
  // Get events for a specific day and timeSlot
  const getEventForTimeSlot = (date: Date, time: number) => {
    return events.find(event => {
      const eventHour = event.date.getHours();
      return isSameDay(event.date, date) && eventHour === time;
    });
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  return (
    <div className="flex-1 bg-white rounded-md border border-gray-200 overflow-auto">
      <div className="min-w-[700px]">
        {/* Calendar Header - Days */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          {/* Time column header */}
          <div className="border-r border-gray-200 p-2 flex items-center justify-center">
            <div className="text-gray-400 text-xs">
              {format(new Date(), 'zzz')}
            </div>
          </div>
          
          {/* Day columns headers */}
          {days.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "p-2 text-center",
                i < days.length - 1 && "border-r border-gray-200",
                isToday(day.fullDate) && "bg-blue-50"
              )}
            >
              <div className="text-gray-500 font-medium">{day.name}</div>
              <div className="text-2xl font-bold">{day.day}</div>
            </div>
          ))}
        </div>
        
        {/* Calendar Body - Time slots and events */}
        <div className="grid grid-cols-8">
          {/* Time slots column */}
          <div className="border-r border-gray-200">
            {timeSlots.map((slot, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-20 flex items-center justify-center text-gray-500 text-sm",
                  i < timeSlots.length - 1 && "border-b border-gray-200"
                )}
              >
                {slot.label}
              </div>
            ))}
          </div>
          
          {/* Calendar cells for each day and time slot */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className={cn(
              "relative",
              dayIndex < days.length - 1 && "border-r border-gray-200",
              isToday(day.fullDate) && "bg-blue-50"
            )}>
              {timeSlots.map((timeSlot, timeIndex) => {
                const event = getEventForTimeSlot(day.fullDate, timeSlot.time);
                return (
                  <div 
                    key={timeIndex} 
                    className={cn(
                      "h-20 relative",
                      timeIndex < timeSlots.length - 1 && "border-b border-gray-200"
                    )}
                  >
                    {event && (
                      <div 
                        className="absolute inset-1 rounded-md p-2 text-white flex flex-col"
                        style={{ backgroundColor: event.color }}
                      >
                        <span className="text-xs">{format(event.date, 'h:mm a')}</span>
                        <span className="font-medium">{event.title}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
