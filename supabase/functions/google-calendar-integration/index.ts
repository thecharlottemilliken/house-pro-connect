
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { google } from "npm:googleapis@126";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Interface for meeting request
interface CalendarMeetingRequest {
  projectId: string;
  projectTitle: string;
  ownerEmail: string;
  ownerName: string;
  coachName: string;
  meetingDate: string; // ISO string format
  meetingTime: string; // Format: "8:00 AM"
  meetingDuration: number; // In minutes
  coachEmail: string; // Email of the coach scheduling the meeting
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    const { 
      projectId, 
      projectTitle, 
      ownerEmail, 
      ownerName,
      coachName,
      meetingDate, 
      meetingTime, 
      meetingDuration,
      coachEmail
    } = await req.json() as CalendarMeetingRequest;
    
    // Parse date and time to create a JavaScript Date
    const meetingDateTime = new Date(meetingDate);
    
    // Parse the meeting time (e.g., "8:00 AM")
    const timeParts = meetingTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (!meetingDateTime || !timeParts) {
      throw new Error("Invalid date or time format");
    }
    
    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const ampm = timeParts[3].toUpperCase();
    
    // Convert to 24-hour format
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    
    // Set the time portion of the date
    meetingDateTime.setHours(hours, minutes, 0, 0);
    
    // Calculate end time based on meeting duration
    const endDateTime = new Date(meetingDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + meetingDuration);
    
    // Set up Google Calendar API with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
        private_key: Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    
    const calendar = google.calendar({
      version: "v3",
      auth,
    });
    
    // Create the calendar event
    const calendarEvent = {
      summary: `Project Consultation: ${projectTitle}`,
      description: `Coaching session for project: ${projectTitle}`,
      start: {
        dateTime: meetingDateTime.toISOString(),
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/New_York",
      },
      attendees: [
        { email: ownerEmail, displayName: ownerName },
        { email: coachEmail, displayName: coachName }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours before
          { method: "popup", minutes: 30 }, // 30 minutes before
        ],
      },
      sendUpdates: "all", // Send email notifications to attendees
    };
    
    // Insert the event into the calendar
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID") || "primary";
    const result = await calendar.events.insert({
      calendarId,
      requestBody: calendarEvent,
      sendUpdates: "all",
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: result.data.id,
        htmlLink: result.data.htmlLink 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Google Calendar integration error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to create calendar event" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
