
import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, PhoneCall, Paperclip, Edit, FileText, Image } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  // Remove project_title from interface since it doesn't exist in the database
}

interface MeetingNote {
  id: string;
  content: string;
  createdBy: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  attachments?: Array<{
    name: string;
    extension: string;
    size: string;
  }>;
}

interface MeetingsViewProps {
  projectId: string;
}

const MeetingsView: React.FC<MeetingsViewProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const { teamMembers } = useTeamMembers(projectId);

  // Fetch meetings for this project
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('project_events')
          .select('*')
          .eq('project_id', projectId)
          .order('start_time', { ascending: true });
          
        if (error) throw error;
        
        // Convert to our Meeting interface
        const fetchedMeetings = data.map(event => ({
          id: event.id,
          title: event.title,
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location || "000 000 0000",
          description: event.description || "We'll discuss your vision for a stunning kitchen renovation! We'll review your designs, timeline, and budget to bring your dream kitchen to life. Please come prepared with all of the necessary documentation."
          // Remove project_title from mapping since it doesn't exist
        }));
        
        setMeetings(fetchedMeetings);
        
        // If there's at least one meeting, select it by default
        if (fetchedMeetings.length > 0) {
          setSelectedMeeting(fetchedMeetings[0]);
          
          // Mock data for meeting notes - in a real app this would be from an API
          setMeetingNotes([
            {
              id: "1",
              content: "Due to the growing market demand for home appliances, the order volume for Pinnacle Supply Hub has increased by 30%. This task involves coordinating with the logistics and inventory teams to ensure that sufficient stock levels are maintained and shipments are processed on time. Additionally, communicate with the finance team to adjust payment terms and update pricing if necessary to accommodate the larger order volumes.",
              createdBy: {
                name: "Candice Wu",
                avatar: "/placeholder.svg"
              },
              createdAt: "1 hours ago",
              attachments: [
                {
                  name: "1243571294812",
                  extension: "pdf",
                  size: "20 KB"
                }
              ]
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
        toast.error("Failed to load meetings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetings();
  }, [projectId]);

  const handleSaveNote = () => {
    if (newNote.trim()) {
      const newNoteItem: MeetingNote = {
        id: Date.now().toString(),
        content: newNote,
        createdBy: {
          name: "You",
          avatar: "/placeholder.svg"
        },
        createdAt: "Just now",
      };
      setMeetingNotes([newNoteItem, ...meetingNotes]);
      setNewNote("");
      toast.success("Note saved successfully!");
    } else {
      toast.error("Cannot save empty note");
    }
  };
  
  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading meetings...</div>;
  }

  if (meetings.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No meetings scheduled</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            There are no meetings scheduled for this project yet. 
          </p>
          <Button className="mt-4 bg-[#0f566c] hover:bg-[#0d4a5d]">
            Schedule Meeting
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left sidebar - Meeting list */}
      <div className="w-full lg:w-80 lg:border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-800">Your Meeting History</h2>
        </div>
        <div>
          {meetings.map(meeting => (
            <div 
              key={meeting.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMeeting?.id === meeting.id ? 'bg-gray-50' : ''}`}
              onClick={() => handleMeetingClick(meeting)}
            >
              <h3 className="font-medium text-gray-900">{meeting.title}</h3>
              <p className="text-sm text-gray-500">
                {format(parseISO(meeting.start_time), "EEEE, MMMM do")}
              </p>
              <p className="text-sm text-gray-500">
                {format(parseISO(meeting.start_time), "h:mm a")} - {format(parseISO(meeting.end_time), "h:mm a")} EST
              </p>
              <div className="flex mt-2 -space-x-2">
                <Avatar className="border-2 border-background h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main content - Meeting details */}
      {selectedMeeting && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h1>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {format(parseISO(selectedMeeting.start_time), "EEEE, MMMM do")} — 
                  {format(parseISO(selectedMeeting.start_time), "h:mm a")} - {format(parseISO(selectedMeeting.end_time), "h:mm a")} EST
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                EDIT
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <PhoneCall className="h-4 w-4 mr-2" />
                CALL SUSAN
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                ADD TO CALENDAR
              </Button>
            </div>
          </div>
          
          {/* Location and Description */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Location</h3>
                <div className="flex items-center text-sm text-gray-900">
                  <PhoneCall className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{selectedMeeting.location}</span>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Details</h3>
                <p className="text-sm text-gray-900">
                  {selectedMeeting.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Participants and Attachments in flex layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Participants Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium mb-3">Participants</h3>
              <div className="space-y-3">
                {teamMembers.slice(0, 3).map((member, index) => (
                  <div key={index} className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}{member.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </div>
                ))}
                
                {teamMembers.length === 0 && (
                  <>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Sarah Johnson</span>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>BL</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Brian Lee</span>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>ED</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Emily Davis</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Attachments Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium mb-3">Attachments</h3>
              <div className="space-y-2">
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="bg-gray-200 p-2 rounded mr-3 flex-shrink-0">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-xs font-medium">Project Plan.pdf</span>
                </div>
                
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="bg-gray-200 p-2 rounded mr-3 flex-shrink-0">
                    <Image className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-xs font-medium">Budget Overview.png</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Meeting Notes Section */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4">Meeting Notes</h2>
            <div className="border rounded-md">
              <div className="flex flex-wrap items-center border-b">
                <button className="p-2 border-r hover:bg-gray-50"><span className="font-bold">B</span></button>
                <button className="p-2 border-r hover:bg-gray-50"><span className="italic">I</span></button>
                <button className="p-2 border-r hover:bg-gray-50"><span className="underline">U</span></button>
                <button className="p-2 border-r hover:bg-gray-50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="p-2 border-r hover:bg-gray-50">1</button>
                <button className="p-2 border-r hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
                <button className="p-2 border-r hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
              <Textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Start typing..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end mt-2">
              <Button 
                onClick={handleSaveNote} 
                className="bg-[#0f3a4d] hover:bg-[#0c2c3d] text-white"
              >
                SAVE NOTE
              </Button>
            </div>
            
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes ({meetingNotes.length})</h3>
              
              {meetingNotes.map((note) => (
                <div key={note.id} className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={note.createdBy.avatar} />
                        <AvatarFallback>{note.createdBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{note.createdBy.name}</p>
                        <p className="text-xs text-gray-500">{note.createdAt}</p>
                      </div>
                    </div>
                    <button>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm mt-2">{note.content}</p>
                  
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Attachments ({note.attachments.length})</p>
                      {note.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center">
                            <Paperclip className="h-4 w-4 mr-2 text-gray-600" />
                            <span className="text-xs">{attachment.name}.{attachment.extension}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{attachment.size}</span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsView;
