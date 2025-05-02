
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { EventsService, ProjectEvent } from "./calendar/EventsService";
import { useParams } from "react-router-dom";

const EventsCard = () => {
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();
  
  useEffect(() => {
    const fetchEvents = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        const projectEvents = await EventsService.getProjectEvents(projectId);
        
        // Filter for upcoming events
        const upcomingEvents = projectEvents.filter(event => 
          isAfter(parseISO(event.start_time), new Date())
        );
        
        setEvents(upcomingEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [projectId]);
  
  const formatEventTime = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  return (
    <Card className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-6">
        <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        <Button variant="link" className="text-[#0f3a4d] p-0 font-medium">See All</Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading ? (
          <p className="text-gray-600">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-600">No upcoming events</p>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="border border-gray-100 rounded-md p-4 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                {event.description && <p className="text-gray-600 text-sm mt-1">{event.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {format(parseISO(event.start_time), 'EEEE, MMMM do, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatEventTime(event.start_time, event.end_time)}
                  </span>
                </div>
                {event.location && (
                  <div className="mt-2 text-sm text-gray-600">
                    Location: {event.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsCard;
