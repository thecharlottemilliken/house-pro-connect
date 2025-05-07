
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventsService, ProjectEvent } from "./calendar/EventsService";
import { format, addDays, startOfWeek, endOfWeek, differenceInMinutes, isSameDay, parseISO, addMonths, isToday } from "date-fns";

interface ScheduleCardWidgetProps {
  projectId: string;
  className?: string;
}

const ScheduleCardWidget = ({
  projectId,
  className
}: ScheduleCardWidgetProps) => {
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), "MMMM yyyy"));
  const [completionPercentage, setCompletionPercentage] = useState<number>(30);
  const [visibleDays, setVisibleDays] = useState<number>(5);

  // Initialize the week dates
  useEffect(() => {
    updateWeekDates(new Date());
  }, []);

  // Adjust visible days based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 400) {
        setVisibleDays(3);
      } else if (window.innerWidth < 640) {
        setVisibleDays(4);
      } else {
        setVisibleDays(5);
      }
    };
    
    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update week dates when changing selected date
  const updateWeekDates = (baseDate: Date) => {
    const weekStart = startOfWeek(baseDate, {
      weekStartsOn: 1
    }); // Start from Monday
    const dates = Array(7).fill(0).map((_, i) => addDays(weekStart, i));
    setWeekDates(dates);
    setCurrentMonth(format(baseDate, "MMMM yyyy"));
  };

  // Navigate to previous week
  const navigatePrevWeek = () => {
    const newBaseDate = addDays(weekDates[0], -7);
    updateWeekDates(newBaseDate);
  };

  // Navigate to next week
  const navigateNextWeek = () => {
    const newBaseDate = addDays(weekDates[0], 7);
    updateWeekDates(newBaseDate);
  };

  // Fetch events for the project
  useEffect(() => {
    const fetchEvents = async () => {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const fetchedEvents = await EventsService.getProjectEvents(projectId);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [projectId]);

  // Filter events for the selected date
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return isSameDay(eventDate, selectedDate);
  });

  // Format time from ISO string
  const formatEventTime = (isoString: string) => {
    return format(new Date(isoString), "h:mma").toLowerCase();
  };

  // Format event time range
  const formatEventTimeRange = (startTime: string, endTime: string) => {
    return `${formatEventTime(startTime)}-${formatEventTime(endTime)}`;
  };

  // Check if event is happening within the next hour
  const isEventSoon = (eventTime: string) => {
    const eventDate = parseISO(eventTime);
    const now = new Date();
    const minutesUntilEvent = differenceInMinutes(eventDate, now);
    return minutesUntilEvent > 0 && minutesUntilEvent <= 60;
  };

  // Get minutes until event
  const getMinutesUntilEvent = (eventTime: string) => {
    const eventDate = parseISO(eventTime);
    const now = new Date();
    return differenceInMinutes(eventDate, now);
  };

  // Get visible date range based on screen size
  const visibleDates = weekDates.slice(0, visibleDays);

  return (
    <Card className={cn("overflow-hidden shadow-md border border-gray-200 rounded-xl h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between bg-white border-b px-4 py-3">
        <h3 className="text-base sm:text-lg font-semibold">Schedule</h3>
        <div className="text-orange-500 font-medium text-sm sm:text-base">
          {completionPercentage}% Complete
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 bg-white flex-1 flex flex-col">
        {/* Month and year display */}
        <div className="text-gray-500 text-xs sm:text-sm font-medium mb-2">
          {currentMonth}
        </div>
        
        {/* Week date selector */}
        <div className="flex items-center mb-3 sm:mb-4">
          <Button variant="ghost" size="sm" onClick={navigatePrevWeek} className="p-1 h-auto text-gray-600">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex gap-1 h-auto flex-grow justify-center">
            {visibleDates.map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              return (
                <Button 
                  key={index} 
                  variant="ghost" 
                  className={cn(
                    "flex-col items-center gap-1 rounded-lg border py-1 sm:py-2 w-10 sm:w-14 px-0", 
                    isSelected ? 
                      "bg-orange-500 text-white hover:bg-orange-600 border-orange-500" : 
                      "bg-white text-gray-800 hover:bg-gray-100 border-gray-200"
                  )} 
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="text-xs uppercase">
                    {format(date, "EEE").substring(0, 3)}
                  </span>
                  <span className="text-sm sm:text-lg font-bold">
                    {format(date, "dd")}
                  </span>
                </Button>
              );
            })}
          </div>
          
          <Button variant="ghost" size="sm" onClick={navigateNextWeek} className="p-1 h-auto text-gray-600">
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Event list for selected date */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="animate-spin w-5 h-5 sm:w-6 sm:h-6 border-2 border-t-blue-500 border-blue-200 rounded-full"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="pb-3 sm:pb-5 space-y-2 sm:space-y-3 overflow-y-auto max-h-[250px] sm:max-h-[300px]">
              {filteredEvents.map(event => {
                const isSoon = isEventSoon(event.start_time);
                const minutesUntil = isSoon ? getMinutesUntilEvent(event.start_time) : null;
                return (
                  <div 
                    key={event.id} 
                    className={cn("rounded-lg p-3 sm:p-4", 
                      isSoon ? "bg-[#0f566c] text-white" : "bg-white border border-gray-200")}
                  >
                    {isSoon && (
                      <div className="text-white/90 text-xs font-medium mb-1">
                        in {minutesUntil}mins
                      </div>
                    )}
                    <h4 className={cn("font-medium mb-1 text-sm sm:text-base", isSoon ? "text-white" : "text-gray-900")}>
                      {event.title}
                    </h4>
                    <div className={cn("text-xs sm:text-sm", isSoon ? "text-white/80" : "text-gray-600")}>
                      {formatEventTimeRange(event.start_time, event.end_time)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 sm:py-8 text-center text-gray-500 flex-1 flex items-center justify-center">
              <p className="text-sm sm:text-base">No events scheduled for today.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCardWidget;
