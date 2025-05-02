
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarIcon, Calendar, CheckIcon, X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useCoachProjects } from "@/hooks/useCoachProjects";
import { supabase } from "@/integrations/supabase/client";
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
      
      // Send a notification message to the project owner
      const formattedDate = new Date(selectedTimeSlot.date).toLocaleDateString();
      const formattedTime = `${selectedTimeSlot.time} ${selectedTimeSlot.ampm}`;
      
      await supabase.from('coach_messages').insert({
        resident_id: projectToUpdate.owner.id,
        coach_id: (await supabase.auth.getUser()).data.user?.id,
        project_id: selectedProject.id,
        message: `I've scheduled a coaching session with you for ${formattedDate} at ${formattedTime}. Looking forward to discussing your project!`
      });
      
      toast.success("Meeting scheduled successfully!");
      fetchProjects();
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

  // Fixed the formatTimeSlot function to handle potential empty string input
  const formatTimeSlot = (meetupTime: MeetupTime) => {
    if (!meetupTime || !meetupTime.date) return { date: "", time: "" };
    
    try {
      const meetupDate = new Date(meetupTime.date);
      const formattedDate = format(meetupDate, "EEEE, MMMM do");
      return {
        date: formattedDate,
        time: `${meetupTime.time}:00${meetupTime.ampm.toLowerCase()}`
      };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "Invalid date", time: `${meetupTime.time}:00${meetupTime.ampm.toLowerCase()}` };
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

      {/* Schedule Meeting Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold">Schedule a Meeting</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-xl font-semibold mt-6">
              Select from the available time slots.
            </DialogDescription>
            <p className="text-gray-600 mt-2">
              Choose a time to meet with {selectedProject?.owner.name} to discuss their project: {selectedProject?.title}.
            </p>
          </DialogHeader>
          
          <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
            {selectedProject?.meetupTimes.map((meetup, index) => {
              const meetupDate = new Date(meetup.date);
              const isPastDate = meetupDate < new Date();
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
                    <p className="font-medium">{timeSlotFormat.date}</p>
                    <p>{meetup.time}:00 {meetup.ampm} EST</p>
                  </div>
                  
                  {isSelected ? (
                    <div className="bg-blue-700 text-white px-4 py-2 rounded">
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
          
          <div className="flex justify-between mt-6">
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

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Meeting Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTimeSlot && (
                <>
                  Are you sure you want to schedule a meeting with {selectedProject?.owner.name} for {format(new Date(selectedTimeSlot.date), "EEEE, MMMM do")} at {selectedTimeSlot.time}:00 {selectedTimeSlot.ampm}?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleScheduleMeeting}
              disabled={schedulingProject === selectedProject?.id}
            >
              {schedulingProject === selectedProject?.id ? "Scheduling..." : "Confirm Schedule"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

