import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarIcon, Calendar, CheckIcon, X } from "lucide-react";
import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";
import { useCoachProjects } from "@/hooks/useCoachProjects";
import { supabase } from "@/integrations/supabase/client";
import { EventsService } from "@/components/project/calendar/EventsService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface MeetupTime {
  date: string;
  time: string;
  ampm: "AM" | "PM";
}

interface ProjectWithMeetups {
  id: string;
  title: string;
  created_at: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  meetupTimes: MeetupTime[];
}

export const MeetupScheduleWidget = () => {
  const { projects, isLoading, fetchProjects } = useCoachProjects();
  const [schedulingProject, setSchedulingProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectWithMeetups | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<MeetupTime | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // Filter projects that have meetup times and haven't been scheduled yet
  const projectsWithMeetups = projects
    .filter(project => {
      const managementPrefs = project.management_preferences as any;
      return managementPrefs?.wantProjectCoach === "yes" && 
             managementPrefs?.timeSlots && 
             managementPrefs.timeSlots.length > 0 && 
             !managementPrefs.scheduledMeetupTime;
    })
    .map(project => {
      const managementPrefs = project.management_preferences as any;
      return {
        id: project.id,
        title: project.title,
        created_at: project.created_at,
        owner: project.owner,
        meetupTimes: managementPrefs?.timeSlots || []
      };
    });

  const handleScheduleMeeting = async () => {
    if (!selectedProject || !selectedTimeSlot) return;
    
    setSchedulingProject(selectedProject.id);
    
    try {
      // Get the current project data
      const { data: projectData, error: projectError } = await supabase.functions.invoke(
        'get-coach-projects',
        { method: 'GET' }
      );
      
      if (projectError) {
        throw projectError;
      }
      
      // Find the project to update
      const projectToUpdate = projectData.projects.find((p: any) => p.id === selectedProject.id);
      
      if (!projectToUpdate) {
        throw new Error("Project not found");
      }
      
      // Update the management preferences to include the scheduled meetup
      const managementPrefs = projectToUpdate.management_preferences || {};
      
      // Update the project with the selected meetup time
      const { error: updateError } = await supabase.functions.invoke(
        'handle-project-update',
        {
          body: { 
            projectId: selectedProject.id,
            managementPreferences: {
              ...managementPrefs,
              scheduledMeetupTime: selectedTimeSlot,
            }
          }
        }
      );
      
      if (updateError) {
        throw updateError;
      }
      
      // Format date and time for display
      const formattedDate = formatDateSafely(selectedTimeSlot.date);
      const formattedTime = `${selectedTimeSlot.time} ${selectedTimeSlot.ampm}`;
      
      // Send a notification message to the project owner
      await supabase.from('coach_messages').insert({
        resident_id: projectToUpdate.owner.id,
        coach_id: (await supabase.auth.getUser()).data.user?.id,
        project_id: selectedProject.id,
        message: `I've scheduled a coaching session with you for ${formattedDate} at ${formattedTime}. Looking forward to discussing your project!`
      });
      
      // 1. Send an email confirmation to the project owner
      const { data: emailData, error: emailError } = await supabase.functions.invoke(
        'send-meeting-confirmation',
        {
          body: {
            projectId: selectedProject.id,
            projectTitle: selectedProject.title,
            ownerEmail: selectedProject.owner.email,
            ownerName: selectedProject.owner.name,
            meetingDate: formattedDate,
            meetingTime: formattedTime
          }
        }
      );
      
      if (emailError) {
        console.error("Error sending email confirmation:", emailError);
        toast.warning("Meeting scheduled, but email notification failed to send.");
      }
      
      // 3. Add event to the project calendar
      // Fix: Create valid Date objects from the selected time slot
      try {
        // Parse the date from the time slot safely
        if (!selectedTimeSlot.date) {
          throw new Error("Invalid meeting date");
        }
        
        // Create a Date object for the meeting
        const meetingDate = new Date(selectedTimeSlot.date);
        if (!isValid(meetingDate)) {
          throw new Error("Invalid date format");
        }
        
        // Extract the hour from the time string (e.g., "8:00 - 9:00" -> "8")
        let startHour = 0;
        if (selectedTimeSlot.time) {
          // Make sure we correctly extract the hour value
          const timeMatch = selectedTimeSlot.time.match(/^(\d+)/);
          if (timeMatch && timeMatch[1]) {
            startHour = parseInt(timeMatch[1]);
          }
        }
        
        // Set the hours based on AM/PM
        const adjustedHour = selectedTimeSlot.ampm === "PM" && startHour < 12 
          ? startHour + 12 
          : (selectedTimeSlot.ampm === "AM" && startHour === 12 ? 0 : startHour);
        
        meetingDate.setHours(adjustedHour, 0, 0, 0);
        const endTime = new Date(meetingDate);
        endTime.setHours(endTime.getHours() + 1); // 1-hour meeting
        
        await EventsService.createProjectEvent({
          project_id: selectedProject.id,
          title: `Coaching Session: ${selectedProject.title}`,
          description: `Initial coaching session for project: ${selectedProject.title}`,
          start_time: meetingDate.toISOString(),
          end_time: endTime.toISOString(),
          location: "Video Call",
          event_type: "coaching_session",
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        });
      } catch (calendarError) {
        console.error("Error adding calendar event:", calendarError);
        toast.warning("Meeting scheduled, but calendar event creation failed.");
      }
      
      toast.success("Meeting scheduled successfully!");
      fetchProjects(); // 2. Refresh to remove the project from pending list
      setIsDialogOpen(false);
      setIsConfirmDialogOpen(false);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Failed to schedule meeting. Please try again.");
    } finally {
      setSchedulingProject(null);
    }
  };

  const openScheduleDialog = (project: ProjectWithMeetups) => {
    setSelectedProject(project);
    setSelectedTimeSlot(null);
    setIsDialogOpen(true);
  };

  // Safe date formatting helper function with proper format
  const formatDateSafely = (dateString: string): string => {
    if (!dateString) return "Invalid date";
    
    try {
      // Make sure we're working with a properly formatted ISO string
      const isoDateString = ensureISODateString(dateString);
      const parsedDate = parseISO(isoDateString);
      
      // Check if date is valid before formatting
      if (!isValid(parsedDate)) {
        console.error("Invalid date:", dateString);
        return "Invalid date";
      }
      
      // Format as "Monday, December 25th, 2023" (including year)
      return format(parsedDate, "EEEE, MMMM do, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid date";
    }
  };

  // Ensure date string is in ISO format
  const ensureISODateString = (dateStr: string): string => {
    // If it's already a valid ISO string, return it
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(dateStr) || 
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(dateStr) ||
        /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Try to convert it to an ISO string
    const date = new Date(dateStr);
    if (isValid(date)) {
      return date.toISOString();
    }
    
    console.warn("Could not parse date string:", dateStr);
    // Return a fallback ISO string if we can't parse it
    return new Date().toISOString();
  };

  // Format time slot display
  const formatTimeSlot = (meetupTime: MeetupTime) => {
    if (!meetupTime || !meetupTime.date) {
      return { date: "Invalid date", time: "" };
    }
    
    try {
      // Format the date safely
      const formattedDate = formatDateSafely(meetupTime.date);
      
      // Handle the time values safely
      const timeStr = meetupTime.time || "";
      const ampmStr = meetupTime.ampm ? meetupTime.ampm.toLowerCase() : "";
      
      return {
        date: formattedDate,
        time: timeStr ? `${timeStr}${ampmStr}` : ""
      };
    } catch (error) {
      console.error("Error in formatTimeSlot:", error, meetupTime);
      return { 
        date: "Invalid date", 
        time: meetupTime.time ? `${meetupTime.time}${meetupTime.ampm?.toLowerCase() || ""}` : "" 
      };
    }
  };

  const handleSelectTimeSlot = (timeSlot: MeetupTime) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleSendInvite = () => {
    setIsConfirmDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>Schedule Project Meetings</CardTitle>
          <CardDescription>Loading available meetings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (projectsWithMeetups.length === 0) {
    return null; // Don't show the widget if there are no projects with meetups
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Schedule Project Meetings</CardTitle>
            <CardDescription>
              New projects requiring initial coaching sessions
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {projectsWithMeetups.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projectsWithMeetups.map((project) => (
            <div key={project.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-500">Owner: {project.owner.name}</p>
                  <p className="text-xs text-gray-400">
                    Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => openScheduleDialog(project)}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Schedule Meeting Dialog - Updated for on-brand styling */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-none shadow-lg">
          <DialogHeader className="border-b pb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold text-gray-900">Schedule a Meeting</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-xl font-semibold mt-6 text-gray-800">
              Select from the available time slots.
            </DialogDescription>
            <p className="text-gray-600 mt-2">
              Choose a time to meet with {selectedProject?.owner.name} to discuss their project: {selectedProject?.title}.
            </p>
          </DialogHeader>
          
          <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
            {selectedProject?.meetupTimes.map((meetup, index) => {
              // Parse and validate date before further processing
              let isPastDate = false;
              
              try {
                const isoDate = ensureISODateString(meetup.date);
                const parsedDate = parseISO(isoDate);
                
                // Only check if it's a past date if parsing was successful
                if (isValid(parsedDate)) {
                  isPastDate = parsedDate < new Date();
                } else {
                  console.error("Invalid date format:", meetup.date);
                }
              } catch (error) {
                console.error("Error parsing date:", error, meetup.date);
              }
              
              const timeSlotFormat = formatTimeSlot(meetup);
              const isSelected = selectedTimeSlot === meetup;
              
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-md flex justify-between items-center ${
                    isSelected 
                      ? "bg-blue-50 border border-blue-200" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{timeSlotFormat.date}</p>
                    <p className="text-gray-600">{meetup.time}:00 {meetup.ampm} EST</p>
                  </div>
                  
                  {isSelected ? (
                    <div className="bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                      <CheckIcon className="h-4 w-4" />
                      SELECTED
                    </div>
                  ) : (
                    <Button 
                      variant="outline"
                      className="border-blue-700 text-blue-700 hover:bg-blue-50"
                      disabled={isPastDate || schedulingProject === selectedProject?.id}
                      onClick={() => handleSelectTimeSlot(meetup)}
                    >
                      SELECT SLOT
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button 
              variant="default"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={!selectedTimeSlot || schedulingProject === selectedProject?.id}
              onClick={handleSendInvite}
            >
              SEND INVITE
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              CANCEL
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Updated for on-brand styling */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-white border-none shadow-lg max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Confirm Meeting Schedule</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {selectedTimeSlot && (
                <div className="text-left mt-2">
                  <p>Are you sure you want to schedule a meeting with:</p>
                  <p className="font-medium text-gray-800 mt-3">Resident: {selectedProject?.owner.name}</p>
                  <p className="font-medium text-gray-800">Project: {selectedProject?.title}</p>
                  <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="font-bold text-blue-800">
                      {formatDateSafely(selectedTimeSlot.date)}
                    </p>
                    <p className="text-blue-700">
                      {selectedTimeSlot.time}:00 {selectedTimeSlot.ampm} EST
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t pt-4 mt-4">
            <AlertDialogCancel className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleScheduleMeeting}
              disabled={schedulingProject === selectedProject?.id}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              {schedulingProject === selectedProject?.id ? "Scheduling..." : "Confirm Schedule"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
