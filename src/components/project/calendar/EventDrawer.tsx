
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ProjectEvent } from "./EventsService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, PhoneCall, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface EventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: ProjectEvent | null;
}

interface EventNote {
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

const EventDrawer: React.FC<EventDrawerProps> = ({ isOpen, onClose, event }) => {
  const [newNote, setNewNote] = useState("");
  
  // Sample event notes for demonstration
  const [eventNotes, setEventNotes] = useState<EventNote[]>([
    {
      id: "1",
      content: "Due to Greg's delay, we won't be able to gather supplies yet. We'll need more time to finalize the design. We need to have a conversation with the supplier and confirm if we can choose their different stock option and request material samples for approval on time. Initial mockup does not contain final colors and we need to provide more samples to customers for review.",
      createdBy: {
        name: "Christina Wu",
        avatar: "/placeholder.svg"
      },
      createdAt: "1 day ago",
      attachments: [
        {
          name: "AGREEMENT2",
          extension: "pdf",
          size: "531 KB"
        }
      ]
    },
    {
      id: "2",
      content: "Due to Greg's delay, we won't be able to gather supplies yet. We'll need more time to finalize the design. We need to have a conversation with the supplier and confirm if we can choose their different stock option and request material samples for approval on time. Initial mockup does not contain final colors and we need to provide more samples to customers for review.",
      createdBy: {
        name: "Christina Wu",
        avatar: "/placeholder.svg"
      },
      createdAt: "1 day ago",
      attachments: [
        {
          name: "AGREEMENT2",
          extension: "pdf",
          size: "531 KB"
        }
      ]
    }
  ]);

  const handleSaveNote = () => {
    if (newNote.trim()) {
      const newNoteItem: EventNote = {
        id: Date.now().toString(),
        content: newNote,
        createdBy: {
          name: "You",
          avatar: "/placeholder.svg"
        },
        createdAt: "Just now",
      };
      setEventNotes([newNoteItem, ...eventNotes]);
      setNewNote("");
    }
  };

  if (!event) return null;

  const formattedDate = event.start_time 
    ? format(parseISO(event.start_time), "EEEE, MMMM do") 
    : "";
    
  const formattedTime = event.start_time && event.end_time
    ? `${format(parseISO(event.start_time), "h:mma")} - ${format(parseISO(event.end_time), "h:mma")} EST`
    : "";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 flex flex-row items-center justify-between border-b border-gray-200">
          <SheetClose className="flex items-center text-gray-600 hover:text-gray-900">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Meeting Details</span>
          </SheetClose>
          
          <Button variant="outline" size="sm" className="text-sm px-2 h-8">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            <span className="ml-1">EDIT</span>
          </Button>
        </SheetHeader>

        <div className="py-6">
          <SheetTitle className="text-xl font-semibold">{event.title}</SheetTitle>
          <div className="text-sm text-gray-600 mt-1">
            {formattedDate && formattedTime && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{`${formattedDate} — ${formattedTime}`}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-5">
            <Button variant="outline" size="sm" className="flex-1">
              <PhoneCall className="h-4 w-4 mr-2" />
              <span>CALL SUSAN</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              <span>ADD TO CALENDAR</span>
            </Button>
          </div>

          <Tabs defaultValue="details" className="mt-5">
            <TabsList className="border-b border-gray-200 w-full justify-start mb-0 bg-transparent p-0">
              <TabsTrigger 
                value="details"
                className="pb-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="pb-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none ml-6"
              >
                Meeting Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Location</h3>
                  <div className="flex items-center text-sm text-gray-900">
                    <PhoneCall className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{event.location || "000 000 0000"}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Participants</h3>
                  <div className="flex -space-x-2">
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

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Details</h3>
                  <p className="text-sm text-gray-900">
                    {event.description || "We'll discuss your vision for a stunning kitchen renovation! We'll review your designs, timeline, and budget to bring your dream kitchen to life. Please come prepared with all of the necessary documentation."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Attachments</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <div className="bg-gray-200 p-2 rounded mr-2">
                          <Paperclip className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Agreement.Doc.PDF</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <div className="bg-gray-200 p-2 rounded mr-2">
                          <Paperclip className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">AnotherFile.JPG</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-4">
                <div>
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
                </div>

                {/* Saved Notes */}
                <div className="space-y-6">
                  {eventNotes.map((note) => (
                    <div key={note.id} className="border-b pb-4">
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
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventDrawer;
