
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BellDot, ChevronDown, Settings, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock notification data - in a real app, this would come from an API or state
const mockNotifications = [
  {
    id: 1,
    users: [{ name: "Jarett King", avatar: "J" }, { name: "Adrinn", avatar: "A" }],
    commentCount: 76,
    project: "High-Fidelity",
    date: "Apr 1",
    read: false
  },
  {
    id: 2,
    users: [{ name: "Adrinn", avatar: "A" }],
    commentCount: 15,
    project: "Rehab Squared Design System",
    date: "Mar 20",
    read: false
  },
  {
    id: 3,
    users: [{ name: "Jarett King", avatar: "J" }],
    type: "comment",
    project: "Wireframes",
    date: "Mar 14",
    read: false,
    content: "I might eliminate this option in the initial atm. But I can confirm after a collaborative chat w/you on the pro dashboard layout/design"
  },
  {
    id: 4,
    users: [{ name: "Jarett King", avatar: "J" }],
    type: "comment",
    project: "Wireframes",
    date: "Mar 14",
    read: false,
    content: "Before interior and exterior selections we need to implement your comment related to the four gtm renovation services: kitchen only, kitchen & baths,..."
  },
  {
    id: 5,
    users: [{ name: "jarettking21@gmail.com", avatar: "J" }],
    type: "view",
    project: "Wireframes",
    date: "Mar 12",
    read: false
  },
  {
    id: 6,
    users: [{ name: "Adrinn", avatar: "A" }],
    type: "mention",
    project: "High-Fidelity",
    date: "Mar 12",
    read: false,
    content: "@Charlotte Milliken When you get some time could you help me understand what needs to be updated on this page?"
  }
];

interface NotificationsPopoverProps {
  hasNotifications: boolean;
  setHasNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationsPopover = ({ hasNotifications, setHasNotifications }: NotificationsPopoverProps) => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread'>('all');
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasNotifications(false);
    // In a real app, this would call an API to mark notifications as read
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full text-white hover:bg-[#174c65]/90 relative"
        >
          <BellDot className="h-6 w-6" />
          {hasNotifications && (
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-[#174c65]"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-1">
            <span className="font-medium">All notifications</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between border-b p-2">
          <div className="flex gap-3">
            <button 
              className={cn(
                "px-2 py-1 text-sm", 
                activeTab === 'all' ? "font-medium" : "text-gray-500"
              )}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={cn(
                "px-2 py-1 text-sm", 
                activeTab === 'unread' ? "font-medium" : "text-gray-500"
              )}
              onClick={() => setActiveTab('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <button 
            className="text-blue-500 text-sm font-medium"
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </button>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {mockNotifications.map((notification) => (
            <div key={notification.id} className="border-b p-3 hover:bg-gray-50">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                    {notification.users[0].avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {notification.users.map((u, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && " and "}{u.name}
                        </React.Fragment>
                      ))}
                      {notification.type === "mention" && 
                        <span className="text-gray-700"> mentioned you</span>
                      }
                      {notification.type === "comment" && 
                        <span className="text-gray-700"> commented</span>
                      }
                      {notification.type === "view" && 
                        <span className="text-gray-700"> can view</span>
                      }
                      {!notification.type && notification.commentCount && 
                        <span className="text-gray-700"> · {notification.commentCount} comments</span>
                      }
                      {notification.project && 
                        <span className="text-gray-700"> · {notification.project}</span>
                      }
                    </div>
                    {notification.content && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{notification.content}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">{notification.date}</span>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                  )}
                </div>
              </div>
              {notification.type === "comment" && (
                <div className="flex items-center mt-1 text-gray-500 text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" /> Commented · Wireframes
                </div>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
