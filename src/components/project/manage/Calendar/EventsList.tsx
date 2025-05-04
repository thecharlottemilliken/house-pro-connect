
import React from "react";

interface EventItem {
  id: string | number;
  title: string;
  day: number;
  time: string;
  color: string;
  fullTime?: string;
}

interface EventsListProps {
  title: string;
  events: EventItem[];
  onEventClick?: (eventId: string | number) => void;
}

const EventsList: React.FC<EventsListProps> = ({ title, events, onEventClick }) => {
  if (events.length === 0) {
    return (
      <div className="mt-4 bg-white p-4 rounded-md shadow-sm">
        <h3 className="text-base font-medium mb-3">{title}</h3>
        <p className="text-sm text-gray-500">No events</p>
      </div>
    );
  }

  const handleEventClick = (eventId: string | number) => {
    if (onEventClick) {
      onEventClick(eventId);
    }
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-base font-medium mb-3">{title}</h3>
      <div className="space-y-2">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
            onClick={() => handleEventClick(event.id)}
          >
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0 mr-3" 
              style={{ backgroundColor: event.color }}
            ></div>
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-gray-500">{event.fullTime || event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;
