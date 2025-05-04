
import { format, isSameDay, isWithinInterval, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import EventDrawer from "@/components/project/calendar/EventDrawer";
import { ProjectEvent } from "@/components/project/calendar/EventsService";

interface CalendarDay {
  day: number;
  name: string;
  month: string;
  fullDate: Date;
}

interface Event {
  id: number | string;
  title: string;
  date: Date;
  color: string;
  description?: string;
  location?: string;
}

interface CalendarGridProps {
  days: CalendarDay[];
  timeSlots: { label: string; time: number }[];
  events: Event[];
  viewMode: "Day" | "Week" | "Month";
}

const CalendarGrid = ({ days, timeSlots, events, viewMode }: CalendarGridProps) => {
  const [selectedEvent, setSelectedEvent] = useState<ProjectEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    // Convert the event format to ProjectEvent format
    const projectEvent: ProjectEvent = {
      id: typeof event.id === 'string' ? event.id : event.id.toString(),
      project_id: '',
      title: event.title,
      description: event.description || '',
      start_time: event.date.toISOString(),
      end_time: new Date(event.date.getTime() + 60 * 60 * 1000).toISOString(), // Add 1 hour by default
      location: event.location || '',
      event_type: '',
      created_by: '',
    };
    
    setSelectedEvent(projectEvent);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Optional: Add a small delay before clearing the selected event
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  // Day view - events for each hour slot
  if (viewMode === "Day" && days.length > 0) {
    const currentDay = days[0].fullDate;
    const dayEvents = events.filter(event => 
      isSameDay(event.date, currentDay)
    );
    
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 h-full">
          {/* Time slots */}
          <div className="overflow-y-auto">
            {timeSlots.map((slot) => {
              // Find events for this time slot
              const slotEvents = dayEvents.filter(event => {
                const eventHour = event.date.getHours();
                return eventHour === slot.time;
              });
              
              return (
                <div key={slot.label} className="grid grid-cols-[80px_1fr] border-b border-gray-100">
                  <div className="p-2 text-xs text-gray-500 text-right pr-4 pt-3 border-r border-gray-100">
                    {slot.label}
                  </div>
                  <div className="p-1 min-h-[60px] relative">
                    {slotEvents.map(event => (
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="absolute top-1 left-1 right-1 rounded p-1 text-xs text-white cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ 
                          backgroundColor: event.color,
                          height: 'calc(100% - 8px)'
                        }}
                      >
                        <div className="font-medium">{event.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <EventDrawer 
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          event={selectedEvent}
        />
      </div>
    );
  }
  
  // Week view - days across, hours down
  if (viewMode === "Week") {
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {/* Day headers */}
          {days.map(day => (
            <div key={day.name} className="text-center p-2 border-b border-gray-200 bg-gray-50 text-sm">
              <div className="font-medium">{day.name}</div>
              <div>{day.day}</div>
            </div>
          ))}
          
          {/* Time slots for each day */}
          <div className="col-span-full grid grid-cols-1" style={{ gridTemplateRows: `repeat(${timeSlots.length}, minmax(80px, 1fr))` }}>
            {timeSlots.map((slot) => (
              <div 
                key={slot.label} 
                className="grid border-b border-gray-100" 
                style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
              >
                {days.map((day) => {
                  // Find events for this day and time slot
                  const cellEvents = events.filter(event => {
                    const eventDate = new Date(event.date);
                    const eventHour = eventDate.getHours();
                    return isSameDay(eventDate, day.fullDate) && eventHour === slot.time;
                  });
                  
                  return (
                    <div key={`${day.day}-${slot.label}`} className="border-r border-gray-100 p-1 min-h-[80px] relative">
                      {cellEvents.map(event => (
                        <div 
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="absolute top-1 left-1 right-1 rounded p-2 text-xs text-white cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ 
                            backgroundColor: event.color,
                            height: 'calc(100% - 8px)'
                          }}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div>{format(event.date, 'h:mm a')}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <EventDrawer 
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          event={selectedEvent}
        />
      </div>
    );
  }
  
  // Month view
  return (
    <div className="flex-1 bg-white rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 h-full">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center p-2 border-b border-gray-200 bg-gray-50 font-medium text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar cells */}
        {Array(35).fill(null).map((_, index) => {
          const date = new Date(2025, 4, index + 1); // May 2025 for example
          const dayEvents = events.filter(event => isSameDay(event.date, date));
          
          return (
            <div key={index} className="border-r border-b border-gray-100 p-2 min-h-[100px]">
              <div className="font-medium text-sm mb-1">{index + 1}</div>
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="rounded p-1 text-xs text-white cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <EventDrawer 
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        event={selectedEvent}
      />
    </div>
  );
};

export default CalendarGrid;
