
import { format } from "date-fns";

// Define TimeSlot interface for improved type safety
export interface TimeSlot {
  id: number;
  date: Date | null;
  time: string;
  ampm: "AM" | "PM";
}

// Interface for the formatted time slot that can be stored in Supabase
// This needs to be a JSON-serializable object
export interface FormattedTimeSlot {
  id: number;
  dateStr: string | null; // ISO string format of the date or null
  time: string;
  ampm: string;
}

// Interface for formatted time slot display
export interface FormattedTimeSlotDisplay {
  dayAndDate: string;
  time: string;
}

// Helper function to convert Date objects to strings for JSON serialization
export const formatTimeSlotsForStorage = (slots: TimeSlot[]): Record<string, any>[] => {
  return slots.map(slot => ({
    id: slot.id,
    dateStr: slot.date ? slot.date.toISOString() : null,
    time: slot.time,
    ampm: slot.ampm
  }));
};

// Helper function to convert stored string dates back to Date objects
export const parseTimeSlotsFromStorage = (formattedSlots: any[]): TimeSlot[] => {
  return formattedSlots.map(slot => ({
    id: slot.id,
    date: slot.dateStr ? new Date(slot.dateStr) : null,
    time: slot.time,
    ampm: slot.ampm as "AM" | "PM"
  }));
};

// Format time slot display to match the UI design
export const formatTimeSlot = (slot: TimeSlot): { dayAndDate: string; time: string } | string => {
  if (!slot.date || !slot.time) {
    return "Select a time and date for your call";
  }
  
  const dayOfWeek = format(slot.date, "EEEE");
  const month = format(slot.date, "MMMM");
  const dayOfMonth = format(slot.date, "do");
  
  // Extract time range parts (e.g., "8:00 - 9:00")
  const timeRange = slot.time;
  const [startTime] = timeRange.split(" - ");
  
  return {
    dayAndDate: `${dayOfWeek}, ${month} ${dayOfMonth}`,
    time: `${startTime}${slot.ampm.toLowerCase()} - ${timeRange.split(" - ")[1]}${slot.ampm.toLowerCase()} EST`
  };
};
