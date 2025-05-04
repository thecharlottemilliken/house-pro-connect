
import { format } from "date-fns";

export interface TimeSlot {
  id?: number;
  date: Date | null;
  time: string;
  ampm: "AM" | "PM";
}

// Adding the GenericTimeSlot interface that can handle both string dates and Date objects
export interface GenericTimeSlot {
  id?: number;
  date?: Date | string | null;
  dateStr?: string;
  time: string;
  ampm: "AM" | "PM";
}

export function formatTimeSlot(slot: TimeSlot): string | { dayAndDate: string; time: string } {
  if (!slot.date || !slot.time) {
    return "Time slot not fully defined";
  }
  
  try {
    const dayAndDate = format(new Date(slot.date), "EEEE, MMMM d, yyyy");
    const time = `${slot.time} ${slot.ampm}`;
    return { dayAndDate, time };
  } catch (error) {
    console.error("Error formatting time slot:", error);
    return "Invalid date format";
  }
}

// Adding the parseTimeSlotToDate function to convert a time slot to start and end date objects
export function parseTimeSlotToDate(timeSlot: GenericTimeSlot): { startDate: Date | null; endDate: Date | null } {
  if (!timeSlot) {
    return { startDate: null, endDate: null };
  }

  try {
    // Use dateStr if available, otherwise use date
    const dateSource = timeSlot.dateStr || timeSlot.date;
    if (!dateSource) {
      console.error("No date source available in time slot:", timeSlot);
      return { startDate: null, endDate: null };
    }

    // Parse the date string to a Date object
    let baseDate: Date;
    if (dateSource instanceof Date) {
      baseDate = dateSource;
    } else {
      baseDate = new Date(dateSource);
    }

    if (!isValidDate(baseDate)) {
      console.error("Invalid date format:", dateSource);
      return { startDate: null, endDate: null };
    }

    // Parse the time range (e.g., "8:00 - 9:00")
    const timeRange = timeSlot.time.split(' - ');
    if (timeRange.length !== 2) {
      console.error("Invalid time range format:", timeSlot.time);
      return { startDate: null, endDate: null };
    }

    // Create start date by combining the base date with the start time
    const startDate = new Date(baseDate);
    const [startHour, startMinute] = timeRange[0].split(':').map(Number);
    
    startDate.setHours(
      timeSlot.ampm === 'PM' && startHour < 12 ? startHour + 12 : startHour,
      startMinute || 0,
      0,
      0
    );

    // Create end date by combining the base date with the end time
    const endDate = new Date(baseDate);
    const [endHour, endMinute] = timeRange[1].split(':').map(Number);
    
    endDate.setHours(
      timeSlot.ampm === 'PM' && endHour < 12 ? endHour + 12 : endHour,
      endMinute || 0,
      0,
      0
    );

    return { startDate, endDate };
  } catch (error) {
    console.error("Error parsing time slot to date:", error, timeSlot);
    return { startDate: null, endDate: null };
  }
}

// Helper function to check if a date is valid
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
