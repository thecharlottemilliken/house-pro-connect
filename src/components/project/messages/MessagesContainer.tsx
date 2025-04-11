
import React, { useState } from "react";
import { Search, Phone, SquareMenu, ExternalLink, Send, Image, Smile, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MessageList from "./MessageList";

interface MessagesContainerProps {
  projectId: string;
}

const MessagesContainer = ({ projectId }: MessagesContainerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      // Here you would implement sending the message to your backend
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header section */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
      </div>
      
      <div className="flex h-[calc(100%-64px)]">
        {/* Messages sidebar */}
        <div className="w-[350px] border-r border-gray-200 flex flex-col bg-white">
          {/* Search and new message */}
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
            <div className="mt-2 flex justify-between items-center">
              <span className="font-medium">Newest</span>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Message list */}
          <MessageList />
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Chat header */}
          <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" alt="Coach" />
                <AvatarFallback>DS</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm text-gray-500">Coach</div>
                <div className="font-medium">Don Smith</div>
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
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {/* Date header */}
            <div className="text-center text-sm text-gray-500 my-4">
              Monday, January 14th
            </div>
            
            {/* User query */}
            <div className="flex justify-end mb-4">
              <div className="bg-[#236175] text-white p-3 rounded-lg max-w-[80%]">
                <p>What advice do you have for choosing the right materials for my kitchen renovation?</p>
              </div>
            </div>
            
            {/* Response */}
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 p-3 rounded-lg max-w-[80%]">
                <p>Absolutely! When selecting materials for your kitchen renovation, consider options that are both resilient and aesthetically pleasing. Look for finishes that not only match your kitchen's overall style but also withstand daily wear and tear. For instance, quartz countertops offer durability and a sleek look, while hardwood cabinets can add warmth and character. Don't forget to think about maintenance as well: some materials are easier to clean than others. Ultimately, choose what feels right for you!</p>
              </div>
            </div>
            
            {/* User response */}
            <div className="flex justify-end mb-2">
              <div className="bg-[#236175] text-white p-3 rounded-lg max-w-[80%]">
                <p>Yes, that works.</p>
                <div className="text-xs text-gray-300 text-right mt-1">Today, 8:37pm</div>
              </div>
            </div>
            
            {/* Another message */}
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 p-3 rounded-lg max-w-[80%]">
                <p>Are we still planning to go over the designs and questions you had tomorrow?</p>
                <div className="text-xs text-gray-500 text-right mt-1">Today, 8:30pm</div>
              </div>
            </div>
            
            {/* User response */}
            <div className="flex justify-end mb-2">
              <div className="bg-[#236175] text-white p-3 rounded-lg max-w-[80%]">
                <p>Yes, that would be great!</p>
                <div className="text-xs text-gray-300 text-right mt-1">Today, 8:37pm</div>
              </div>
            </div>
            
            {/* Another message */}
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 p-3 rounded-lg max-w-[80%]">
                <p>Sounds good, I'll talk to you then.</p>
                <div className="text-xs text-gray-500 text-right mt-1">Today, 8:45pm</div>
              </div>
            </div>
            
            {/* User response */}
            <div className="flex justify-end mb-2">
              <div className="bg-[#236175] text-white p-3 rounded-lg max-w-[80%]">
                <p>Sounds good.</p>
                <div className="text-xs text-gray-300 text-right mt-1">Today, 8:37pm</div>
              </div>
            </div>
          </div>
          
          {/* Message input */}
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
                  <Button type="submit" className="bg-[#0f566c] hover:bg-[#0d4a5d] rounded-full">
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;
