
import { useState } from "react";
import CalendarHeader from "./CalendarHeader";
import MiniCalendar from "./MiniCalendar";
import EventsList from "./EventsList";
import CalendarGrid from "./CalendarGrid";

interface Event {
  id: number;
  title: string;
  day: number;
  time: string;
  color: string;
  fullTime: string;
}

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState("January");
  const [viewMode, setViewMode] = useState("Week");
  
  // Calendar grid data
  const days = [
    { day: 21, name: "SUN", month: "JAN", fullDate: new Date(2024, 0, 21) },
    { day: 22, name: "MON", month: "JAN", fullDate: new Date(2024, 0, 22) },
    { day: 23, name: "TUE", month: "JAN", fullDate: new Date(2024, 0, 23) },
    { day: 24, name: "WED", month: "JAN", fullDate: new Date(2024, 0, 24) },
    { day: 25, name: "THU", month: "JAN", fullDate: new Date(2024, 0, 25) },
    { day: 26, name: "FRI", month: "JAN", fullDate: new Date(2024, 0, 26) },
    { day: 27, name: "SAT", month: "JAN", fullDate: new Date(2024, 0, 27) }
  ];
  
  // Time slots
  const timeSlots = [
    { label: "7 AM", time: 7 },
    { label: "8 AM", time: 8 },
    { label: "9 AM", time: 9 },
    { label: "10 AM", time: 10 },
    { label: "11 AM", time: 11 },
    { label: "12 PM", time: 12 },
    { label: "1 PM", time: 13 },
    { label: "2 PM", time: 14 },
    { label: "3 PM", time: 15 }
  ];
  
  // Sample events data
  const events: Event[] = [
    { 
      id: 1, 
      title: "Tile Delivery", 
      day: 21, 
      time: "09:00 AM", 
      color: "#e84c88",
      fullTime: "9:00 AM"
    },
    { 
      id: 2, 
      title: "Tile Labor", 
      day: 26, 
      time: "10:00 AM", 
      color: "#4bc8eb",
      fullTime: "10:00 AM"
    },
    { 
      id: 3, 
      title: "Coach Call", 
      day: 26, 
      time: "12:00 PM", 
      color: "#9b74e9",
      fullTime: "12:00 PM"
    }
  ];
  
  // Mini calendar grid data
  const miniCalendarDays = [
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true, selected: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true, active: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
    { day: 4, isCurrentMonth: false }
  ];
  
  // Today's events
  const todayEvents = events.filter(event => event.day === 21);
  
  // Tomorrow's events
  const tomorrowEvents = events.filter(event => event.day === 22);

  return (
    <>
      {/* Calendar Navigation */}
      <CalendarHeader 
        currentMonth={currentMonth}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Mini calendar and events */}
        <div className="w-full lg:w-64 flex flex-col">
          {/* Mini Calendar */}
          <MiniCalendar
            currentMonth={currentMonth}
            miniCalendarDays={miniCalendarDays}
          />
          
          {/* Today's Events */}
          <EventsList 
            title="Today"
            events={todayEvents}
          />
          
          {/* Tomorrow's Events */}
          <EventsList 
            title="Tomorrow"
            events={tomorrowEvents}
          />
        </div>
        
        {/* Right side - Calendar grid */}
        <CalendarGrid 
          days={days}
          timeSlots={timeSlots}
          events={events}
        />
      </div>
    </>
  );
};

export default CalendarView;
