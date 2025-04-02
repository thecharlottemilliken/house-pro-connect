
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek, addMonths, parseISO, isSameDay } from "date-fns";
import CalendarHeader from "./CalendarHeader";
import MiniCalendar from "./MiniCalendar";
import EventsList from "./EventsList";
import CalendarGrid from "./CalendarGrid";

interface Event {
  id: number;
  title: string;
  date: Date;
  color: string;
}

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week");
  
  // Set up days for the week view
  const [days, setDays] = useState<Array<{
    day: number;
    name: string;
    month: string;
    fullDate: Date;
  }>>([]);
  
  // Update days when current date changes
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    
    const daysArray = [];
    let day = start;
    
    while (day <= end) {
      daysArray.push({
        day: day.getDate(),
        name: format(day, 'EEE').toUpperCase(),
        month: format(day, 'MMM').toUpperCase(),
        fullDate: new Date(day)
      });
      day = addDays(day, 1);
    }
    
    setDays(daysArray);
  }, [currentDate]);
  
  // Get current month for display
  const currentMonth = format(currentDate, 'MMMM yyyy');
  
  // Time slots for the day
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
  
  // Sample events data with real dates
  const events: Event[] = [
    { 
      id: 1, 
      title: "Tile Delivery", 
      date: addDays(new Date(), -1), 
      color: "#e84c88"
    },
    { 
      id: 2, 
      title: "Tile Labor", 
      date: addDays(new Date(), 2), 
      color: "#4bc8eb"
    },
    { 
      id: 3, 
      title: "Coach Call", 
      date: addDays(new Date(), 2), 
      color: "#9b74e9"
    }
  ];
  
  // Navigation functions
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  const goToPreviousPeriod = () => {
    if (viewMode === "Day") {
      setCurrentDate(prev => addDays(prev, -1));
    } else if (viewMode === "Week") {
      setCurrentDate(prev => addDays(prev, -7));
    } else {
      setCurrentDate(prev => addMonths(prev, -1));
    }
  };
  
  const goToNextPeriod = () => {
    if (viewMode === "Day") {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (viewMode === "Week") {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };
  
  // Mini calendar days generation
  const generateMiniCalendarDays = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDay = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    
    const miniDays = [];
    for (let i = 0; i < 35; i++) {
      const date = addDays(startDay, i);
      miniDays.push({
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === today.getMonth(),
        selected: isSameDay(date, selectedDate),
        active: isSameDay(date, today),
        fullDate: date
      });
    }
    
    return miniDays;
  };
  
  // Filter events for today and tomorrow
  const getTodayEvents = () => {
    const today = new Date();
    return events.filter(event => isSameDay(event.date, today));
  };
  
  const getTomorrowEvents = () => {
    const tomorrow = addDays(new Date(), 1);
    return events.filter(event => isSameDay(event.date, tomorrow));
  };
  
  // Handle date selection in the mini calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };

  return (
    <>
      {/* Calendar Navigation */}
      <CalendarHeader 
        currentMonth={currentMonth}
        viewMode={viewMode}
        setViewMode={setViewMode}
        goToToday={goToToday}
        goToPreviousPeriod={goToPreviousPeriod}
        goToNextPeriod={goToNextPeriod}
      />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Mini calendar and events */}
        <div className="w-full lg:w-64 flex flex-col">
          {/* Mini Calendar */}
          <MiniCalendar
            currentMonth={format(currentDate, 'MMMM')}
            miniCalendarDays={generateMiniCalendarDays()}
            onDateSelect={handleDateSelect}
          />
          
          {/* Today's Events */}
          <EventsList 
            title="Today"
            events={getTodayEvents().map(event => ({
              id: event.id,
              title: event.title,
              day: event.date.getDate(),
              time: format(event.date, 'hh:mm a'),
              color: event.color,
              fullTime: format(event.date, 'h:mm a')
            }))}
          />
          
          {/* Tomorrow's Events */}
          <EventsList 
            title="Tomorrow"
            events={getTomorrowEvents().map(event => ({
              id: event.id,
              title: event.title,
              day: event.date.getDate(),
              time: format(event.date, 'hh:mm a'),
              color: event.color,
              fullTime: format(event.date, 'h:mm a')
            }))}
          />
        </div>
        
        {/* Right side - Calendar grid */}
        <CalendarGrid 
          days={days}
          timeSlots={timeSlots}
          events={events}
          viewMode={viewMode}
        />
      </div>
    </>
  );
};

export default CalendarView;
