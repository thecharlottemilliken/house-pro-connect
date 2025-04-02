
import { cn } from "@/lib/utils";

interface CalendarDay {
  day: number;
  name: string;
  month: string;
  fullDate: Date;
}

interface Event {
  id: number;
  title: string;
  day: number;
  time: string;
  color: string;
  fullTime: string;
}

interface TimeSlot {
  label: string;
  time: number;
}

interface CalendarGridProps {
  days: CalendarDay[];
  timeSlots: TimeSlot[];
  events: Event[];
}

const CalendarGrid = ({ days, timeSlots, events }: CalendarGridProps) => {
  // Get events for a specific day and timeSlot
  const getEventForTimeSlot = (day: number, time: number) => {
    return events.find(event => {
      const eventHour = event.time.includes('AM') 
        ? parseInt(event.time) 
        : (parseInt(event.time) === 12 ? 12 : parseInt(event.time) + 12);
      return event.day === day && eventHour === time;
    });
  };

  return (
    <div className="flex-1 bg-white rounded-md border border-gray-200 overflow-auto">
      <div className="min-w-[700px]">
        {/* Calendar Header - Days */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          {/* Time column header */}
          <div className="border-r border-gray-200 p-2 flex items-center justify-center">
            <div className="text-gray-400 text-xs">EST<br/>GMT-5</div>
          </div>
          
          {/* Day columns headers */}
          {days.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "p-2 text-center",
                i < days.length - 1 && "border-r border-gray-200",
                day.day === 25 && "bg-blue-50"
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
              day.day === 25 && "bg-blue-50"
            )}>
              {timeSlots.map((timeSlot, timeIndex) => {
                const event = getEventForTimeSlot(day.day, timeSlot.time);
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
                        <span className="text-xs">{event.fullTime}</span>
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
