
import { CalendarIcon } from "lucide-react";

interface Event {
  id: number;
  title: string;
  day: number;
  time: string;
  color: string;
  fullTime: string;
}

interface EventsListProps {
  title: string;
  events: Event[];
}

const EventsList = ({ title, events }: EventsListProps) => {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-4 mb-4">
      <div className="flex items-center mb-4">
        <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
        <h3 className="font-medium">{title}</h3>
      </div>
      
      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-3" 
                style={{ backgroundColor: event.color }}
              ></div>
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-500">{event.fullTime}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No events for {title.toLowerCase()}</p>
      )}
    </div>
  );
};

export default EventsList;
