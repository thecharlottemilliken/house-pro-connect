
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageItemProps {
  name: string;
  role: string;
  snippet: string;
  time: string;
  avatar: string;
  isNew?: boolean;
}

const MessageItem = ({ name, role, snippet, time, avatar, isNew }: MessageItemProps) => {
  const initials = name.split(' ').map(word => word[0]).join('');
  
  return (
    <div className={`flex items-start gap-3 p-4 hover:bg-gray-100 cursor-pointer ${isNew ? 'bg-blue-50 hover:bg-blue-100' : ''}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500 whitespace-nowrap">{time}</div>
        </div>
        <div className="text-sm text-gray-500">{role}</div>
        <div className="text-sm text-gray-700 truncate">{snippet}</div>
      </div>
      {isNew && (
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
      )}
    </div>
  );
};

const MessageList = () => {
  const messages = [
    {
      name: "Don Smith",
      role: "Coach",
      snippet: "Did you have any more questions regarding the pricing and designs for your kitchen pro...",
      time: "15min",
      avatar: "/placeholder.svg",
      isNew: true
    },
    {
      name: "Sarah Lee",
      role: "Landscaper",
      snippet: "Thank you for your help! Could you please give me an update on when you think the...",
      time: "1hr",
      avatar: "/placeholder.svg",
      isNew: false
    },
    {
      name: "Gary Fisher",
      role: "Plumber",
      snippet: "I appreciate it. I'll let you know if I have any other questions.",
      time: "1 day",
      avatar: "/placeholder.svg",
      isNew: false
    },
    {
      name: "Sophia Jackson",
      role: "Designer",
      snippet: "Everything looks great! Your team did a fantastic job on getting everything working...",
      time: "12/24/24",
      avatar: "/placeholder.svg",
      isNew: false
    },
  ];
  
  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <MessageItem key={index} {...message} />
      ))}
    </div>
  );
};

export default MessageList;
