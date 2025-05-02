
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format, parseISO, isAfter, isValid } from "date-fns";
import { EventsService, ProjectEvent } from "./calendar/EventsService";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const EventsCard = () => {
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
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
        
        // Sort by date
        const sortedEvents = upcomingEvents.sort((a, b) => 
          parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
        );
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [projectId]);
  
  const formatEventTime = (startTime: string, endTime: string) => {
    try {
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      
      if (!isValid(start) || !isValid(end)) {
        return "Invalid time";
      }
      
      return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    } catch (error) {
      console.error("Error formatting event time:", error);
      return "Invalid time";
    }
  };
  
  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "coaching_session":
        return <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-2">Coach Meeting</span>;
      case "milestone":
        return <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded mr-2">Milestone</span>;
      case "meeting":
        return <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">Meeting</span>;
      default:
        return <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">{eventType}</span>;
    }
  };
  
  const handleSeeAll = () => {
    navigate(`/project-manage/${projectId}/calendar`);
  };

  return (
    <Card className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-6">
        <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        <Button 
          variant="link" 
          className="text-[#0f3a4d] p-0 font-medium"
          onClick={handleSeeAll}
        >
          See All
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading ? (
          <p className="text-gray-600">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-600">No upcoming events</p>
        ) : (
          <div className="space-y-4">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="border border-gray-100 rounded-md p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  {getEventTypeLabel(event.event_type)}
                </div>
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
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {event.location}
                    </span>
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
