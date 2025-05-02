
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

// Parse time string like "8:00 - 9:00" to get start and end hours
export const parseTimeRange = (timeString: string): { startHour: number; endHour: number } => {
  const parts = timeString.split(" - ");
  
  if (parts.length !== 2) {
    return { startHour: 0, endHour: 0 };
  }
  
  const startParts = parts[0].split(":");
  const endParts = parts[1].split(":");
  
  const startHour = parseInt(startParts[0], 10);
  const endHour = parseInt(endParts[0], 10);
  
  return {
    startHour: isNaN(startHour) ? 0 : startHour,
    endHour: isNaN(endHour) ? 0 : endHour
  };
};

// Updated interface for more generic time slot input to handle MeetupTime
export interface GenericTimeSlot {
  dateStr?: string | null;
  date?: Date | string | null;
  time: string;
  ampm: string | "AM" | "PM";
}

// Parse a time slot to get a Date object with the correct time - updated to accept more generic inputs
export const parseTimeSlotToDate = (timeSlot: GenericTimeSlot): { startDate: Date | null; endDate: Date | null } => {
  if (!timeSlot) {
    return { startDate: null, endDate: null };
  }
  
  // Get the date source - either dateStr or date property
  const dateSource = timeSlot.dateStr !== undefined ? 
    timeSlot.dateStr : 
    (timeSlot.date !== undefined ? timeSlot.date : null);
  
  if (!dateSource) {
    return { startDate: null, endDate: null };
  }
  
  // Create a Date object
  let baseDate: Date;
  try {
    baseDate = typeof dateSource === 'string' ? new Date(dateSource) : 
              dateSource instanceof Date ? dateSource : new Date();
              
    if (isNaN(baseDate.getTime())) {
      console.error("Invalid date:", dateSource);
      return { startDate: null, endDate: null };
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return { startDate: null, endDate: null };
  }
  
  // Parse time range from time string
  const { startHour, endHour } = parseTimeRange(timeSlot.time);
  
  // Adjust hours for AM/PM
  const ampm = typeof timeSlot.ampm === 'string' ? timeSlot.ampm.toUpperCase() as "AM" | "PM" : timeSlot.ampm;
  const adjustedStartHour = ampm === "PM" && startHour < 12 ? 
    startHour + 12 : 
    (ampm === "AM" && startHour === 12 ? 0 : startHour);
    
  const adjustedEndHour = ampm === "PM" && endHour < 12 ? 
    endHour + 12 : 
    (ampm === "AM" && endHour === 12 ? 0 : endHour);
  
  // Create start and end date objects
  const startDate = new Date(baseDate);
  startDate.setHours(adjustedStartHour, 0, 0, 0);
  
  const endDate = new Date(baseDate);
  endDate.setHours(adjustedEndHour, 0, 0, 0);
  
  return { startDate, endDate };
};

// Format time slot display to match the UI design
export const formatTimeSlot = (slot: TimeSlot): { dayAndDate: string; time: string } | string => {
  if (!slot.date || !slot.time) {
    return "Select a time and date for your call";
  }
  
  const dayOfWeek = format(slot.date, "EEEE");
  const month = format(slot.date, "MMMM");
  const dayOfMonth = format(slot.date, "dd"); // Changed from 'do' to 'dd' for "DD" format
  const year = format(slot.date, "yyyy");
  
  // Extract time range parts (e.g., "8:00 - 9:00")
  const timeRange = slot.time;
  const [startTime] = timeRange.split(" - ");
  
  return {
    dayAndDate: `${dayOfWeek}, ${month} ${dayOfMonth}, ${year}`, // Added year and changed format to match request
    time: `${startTime}${slot.ampm.toLowerCase()} - ${timeRange.split(" - ")[1]}${slot.ampm.toLowerCase()} EST`
  };
};
