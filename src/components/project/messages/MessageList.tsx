
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

const MessageList = ({ messages, loading }: MessageListProps) => {
  const { user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading messages...</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOutgoing = message.sender_id === user?.id;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2 max-w-[70%] ${isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender_id}`} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              
              <div
                className={`rounded-lg px-4 py-2 ${
                  isOutgoing
                    ? 'bg-[#0f566c] text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
