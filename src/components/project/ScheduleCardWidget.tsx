
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventsService, ProjectEvent } from "./calendar/EventsService";
import { format, addDays, startOfWeek } from "date-fns";

interface ScheduleCardWidgetProps {
  projectId: string;
  className?: string;
}

const ScheduleCardWidget = ({ projectId, className }: ScheduleCardWidgetProps) => {
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  // Initialize the week dates
  useEffect(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
    const dates = Array(7).fill(0).map((_, i) => addDays(weekStart, i));
    setWeekDates(dates);
    setSelectedDate(today);
  }, []);

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
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  // Format time from ISO string
  const formatEventTime = (isoString: string) => {
    return format(new Date(isoString), "h:mm a");
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-[#f8f9fa] border-b p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Schedule</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-600 hover:text-blue-800 p-0"
            onClick={() => {}}
          >
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Week date selector */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
          {weekDates.map((date, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "flex-shrink-0 h-auto py-2 px-3 flex flex-col items-center gap-1 rounded-lg",
                date.toDateString() === selectedDate.toDateString() 
                  ? "bg-blue-100 text-blue-700" 
                  : "hover:bg-gray-100"
              )}
              onClick={() => setSelectedDate(date)}
            >
              <span className="text-xs font-medium">
                {format(date, "EEE")}
              </span>
              <span className="text-lg font-bold">
                {format(date, "d")}
              </span>
            </Button>
          ))}
        </div>

        {/* Event list for selected date */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No events scheduled for {format(selectedDate, "MMMM d")}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {}}
            >
              Schedule Event
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleCardWidget;
