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

  // Initialize the week dates
  useEffect(() => {
    updateWeekDates(new Date());
  }, []);

  // Update week dates when changing selected date
  const updateWeekDates = (baseDate: Date) => {
    const weekStart = startOfWeek(baseDate, {
      weekStartsOn: 1
    }); // Start from Monday
    const dates = Array(5).fill(0).map((_, i) => addDays(weekStart, i));
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
  return <Card className={cn("overflow-hidden shadow-md border border-gray-200 rounded-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-5 bg-white border-b">
        <h3 className="text-lg font-semibold">Schedule</h3>
        <div className="text-orange-500 font-medium">
          {completionPercentage}% Complete
        </div>
      </CardHeader>

      <CardContent className="p-4 bg-white px-[8px] py-[8px]">
        {/* Month and year display */}
        <div className="text-gray-500 pt-4 pb-3 text-sm font-medium px-0 py-0">
          {currentMonth}
        </div>
        
        {/* Week date selector */}
        <div className="flex items-center mb-4 px-0 py-[8px]">
          <Button variant="ghost" size="sm" onClick={navigatePrevWeek} className="p-1 h-auto text-gray-600 px-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-1 h-auto flex-grow justify-center">
            {weekDates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            return <Button key={index} variant="ghost" className={cn("flex-col items-center gap-1 rounded-lg border py-[8px] w-14", isSelected ? "bg-orange-500 text-white hover:bg-orange-600 border-orange-500" : "bg-white text-gray-800 hover:bg-gray-100 border-gray-200")} onClick={() => setSelectedDate(date)}>
                  <span className="text-xs uppercase">
                    {format(date, "EEE").substring(0, 3)}
                  </span>
                  <span className="text-lg font-bold">
                    {format(date, "dd")}
                  </span>
                </Button>;
          })}
          </div>
          
          <Button variant="ghost" size="sm" onClick={navigateNextWeek} className="p-1 h-auto text-gray-600 px-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Event list for selected date */}
        {isLoading ? <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full"></div>
          </div> : filteredEvents.length > 0 ? <div className="pb-5 space-y-3 px-0">
            {filteredEvents.map(event => {
          const isSoon = isEventSoon(event.start_time);
          const minutesUntil = isSoon ? getMinutesUntilEvent(event.start_time) : null;
          return <div key={event.id} className={cn("rounded-lg p-4", isSoon ? "bg-[#0f566c] text-white" : "bg-white border border-gray-200")}>
                  {isSoon && <div className="text-white/90 text-xs font-medium mb-1">
                      in {minutesUntil}mins
                    </div>}
                  <h4 className={cn("font-medium mb-1 text-base", isSoon ? "text-white" : "text-gray-900")}>
                    {event.title}
                  </h4>
                  <div className={cn("text-sm", isSoon ? "text-white/80" : "text-gray-600")}>
                    {formatEventTimeRange(event.start_time, event.end_time)}
                  </div>
                </div>;
        })}
          </div> : <div className="py-8 px-5 text-center text-gray-500">
            <p className="mb-0">No events scheduled for today.</p>
          </div>}
      </CardContent>
    </Card>;
};
export default ScheduleCardWidget;
