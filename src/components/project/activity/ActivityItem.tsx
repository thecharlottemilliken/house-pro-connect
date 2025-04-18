
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ActivityItemProps {
  title?: string;
  role?: string;
  personName?: string;
  date?: string;
  avatarSrc?: string;
  // For backward compatibility with existing code
  item?: {
    id: number;
    user: string;
    userImage: string;
    action: string;
    item: string;
    timestamp: string;
  };
}

const ActivityItem = ({ 
  title, 
  role, 
  personName, 
  date, 
  avatarSrc,
  item 
}: ActivityItemProps) => {
  // If item is provided, use its properties
  const displayName = personName || (item ? item.user : "");
  const displayTitle = title || (item ? `${item.action} ${item.item}` : "");
  const displayDate = date || (item ? new Date(item.timestamp).toLocaleDateString() : "");
  const displayAvatarSrc = avatarSrc || (item ? item.userImage : "");
  const displayRole = role || "User";

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="py-4 border-b border-gray-200 px-4">
      <div className="flex flex-col sm:flex-row sm:items-start">
        <Avatar className="h-10 w-10 mr-4 hidden sm:block">
          <AvatarImage src={displayAvatarSrc} alt={displayName} />
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{displayTitle}</h3>
          <p className="text-sm text-gray-500">{displayRole}: {displayName}</p>
        </div>
        <div className="text-sm text-gray-500 mt-1 sm:mt-0">{displayDate}</div>
      </div>
    </div>
  );
};

export default ActivityItem;
