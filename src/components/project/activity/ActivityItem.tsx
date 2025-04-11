
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ActivityItemProps {
  title: string;
  role: string;
  personName: string;
  date: string;
  avatarSrc?: string;
}

const ActivityItem = ({ 
  title, 
  role, 
  personName, 
  date, 
  avatarSrc 
}: ActivityItemProps) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="py-4 border-b border-gray-200">
      <div className="flex items-start">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage src={avatarSrc} alt={personName} />
          <AvatarFallback>{getInitials(personName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{role}: {personName}</p>
        </div>
        <div className="text-sm text-gray-500">{date}</div>
      </div>
    </div>
  );
};

export default ActivityItem;
