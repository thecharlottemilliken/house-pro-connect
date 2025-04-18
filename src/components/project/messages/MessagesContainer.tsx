import React, { useState } from "react";
import { Search, Phone, SquareMenu, ExternalLink, Send, Image, Smile, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProjectMessages } from "@/hooks/useProjectMessages";
import MessageList from "./MessageList";
import ProjectParticipants from "./ProjectParticipants";

interface MessagesContainerProps {
  projectId: string;
}

interface ParticipantInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

const MessagesContainer = ({ projectId }: MessagesContainerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantInfo | null>(null);
  
  const { messages, loading, sendMessage } = useProjectMessages(
    projectId,
    selectedParticipant?.id || null
  );
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && selectedParticipant) {
      try {
        await sendMessage(messageText.trim());
        setMessageText("");
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
      </div>
      
      <div className="flex h-[calc(100%-64px)]">
        <div className="w-[350px] border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ProjectParticipants 
            projectId={projectId}
            onSelectParticipant={setSelectedParticipant}
          />
        </div>
        
        <div className="flex-1 flex flex-col h-full">
          {selectedParticipant ? (
            <>
              <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" alt={selectedParticipant.name} />
                    <AvatarFallback>{selectedParticipant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm text-gray-500 capitalize">{selectedParticipant.role}</div>
                    <div className="font-medium">{selectedParticipant.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <SquareMenu className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <MessageList messages={messages} loading={loading} />
              </div>
              
              <div className="bg-white p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex flex-col">
                  <div className="border border-gray-300 rounded-lg p-3">
                    <Textarea 
                      placeholder="Type your message here..." 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="resize-none border-0 focus:ring-0 p-0 min-h-[80px]"
                    />
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8">
                          <Image className="h-5 w-5 text-gray-500" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8">
                          <Smile className="h-5 w-5 text-gray-500" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8">
                          <Paperclip className="h-5 w-5 text-gray-500" />
                        </Button>
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-[#0f566c] hover:bg-[#0d4a5d] rounded-full"
                        disabled={!messageText.trim() || !selectedParticipant}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
              Select a participant to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;
