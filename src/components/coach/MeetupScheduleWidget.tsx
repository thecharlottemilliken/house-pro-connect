
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarIcon, Calendar, CheckIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCoachProjects } from "@/hooks/useCoachProjects";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  const handleScheduleMeeting = async (projectId: string, meetupTime: MeetupTime) => {
    setSchedulingProject(projectId);
    
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
      const projectToUpdate = projectData.projects.find((p: any) => p.id === projectId);
      
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
            projectId,
            managementPreferences: {
              ...managementPrefs,
              scheduledMeetupTime: meetupTime,
            }
          }
        }
      );
      
      if (updateError) {
        throw updateError;
      }
      
      // Send a notification message to the project owner
      const formattedDate = new Date(meetupTime.date).toLocaleDateString();
      const formattedTime = `${meetupTime.time} ${meetupTime.ampm}`;
      
      await supabase.from('coach_messages').insert({
        resident_id: projectToUpdate.owner.id,
        coach_id: (await supabase.auth.getUser()).data.user?.id,
        project_id: projectId,
        message: `I've scheduled a coaching session with you for ${formattedDate} at ${formattedTime}. Looking forward to discussing your project!`
      });
      
      toast.success("Meeting scheduled successfully!");
      fetchProjects();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Failed to schedule meeting. Please try again.");
    } finally {
      setSchedulingProject(null);
    }
  };

  const openScheduleDialog = (project: ProjectWithMeetups) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
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

      {/* Meeting time selection dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Meeting Time</DialogTitle>
            <DialogDescription>
              Select a time slot for your coaching session with {selectedProject?.owner.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Available meeting times:</h4>
            <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
              {selectedProject?.meetupTimes.filter(time => time.date).map((meetup, index) => {
                const meetupDate = new Date(meetup.date);
                const isPastDate = meetupDate < new Date();
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={`flex items-center justify-start gap-2 ${isPastDate ? 'opacity-50' : ''}`}
                    onClick={() => !isPastDate && handleScheduleMeeting(selectedProject.id, meetup)}
                    disabled={isPastDate || schedulingProject === selectedProject?.id}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {meetupDate.toLocaleDateString()} {meetup.time} {meetup.ampm}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
