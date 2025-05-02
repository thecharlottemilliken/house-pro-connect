import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek, addMonths, parseISO, isSameDay, isAfter } from "date-fns";
import CalendarHeader from "./CalendarHeader";
import MiniCalendar from "./MiniCalendar";
import EventsList from "./EventsList";
import CalendarGrid from "./CalendarGrid";
import { useParams } from "react-router-dom";
import { EventsService, ProjectEvent } from "@/components/project/calendar/EventsService";
import { toast } from "sonner";

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

const CalendarView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set up days for the week view
  const [days, setDays] = useState<Array<CalendarDay>>([]);
  
  // Fetch real events from database
  useEffect(() => {
    const fetchEvents = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        const projectEvents = await EventsService.getProjectEvents(projectId);
        
        // Map database events to calendar events
        const mappedEvents = projectEvents.map(event => {
          // Color based on event type
          let color = "#4bc8eb"; // Default blue
          
          if (event.event_type === "coaching_session") {
            color = "#9b74e9"; // Purple for coaching sessions
          } else if (event.event_type === "milestone") {
            color = "#e84c88"; // Pink for milestones
          }
          
          return {
            id: event.id || "",
            title: event.title,
            date: parseISO(event.start_time),
            color: color,
            description: event.description,
            location: event.location
          };
        });
        
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        toast.error("Failed to load calendar events");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [projectId]);
  
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
    { label: "3 PM", time: 15 },
    { label: "4 PM", time: 16 },
    { label: "5 PM", time: 17 },
    { label: "6 PM", time: 18 }
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
    return events.filter(event => isSameDay(event.date, today))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };
  
  const getTomorrowEvents = () => {
    const tomorrow = addDays(new Date(), 1);
    return events.filter(event => isSameDay(event.date, tomorrow))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
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
