
import { format } from "date-fns";

export interface TimeSlot {
  id?: number;
  date: Date | null;
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
