
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BellDot } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationsPopoverProps {
  hasNotifications?: boolean;
  setHasNotifications?: (value: boolean) => void;
}

const NotificationsPopover = ({ hasNotifications, setHasNotifications }: NotificationsPopoverProps = {}) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, isActionInProgress, markAsRead } = useNotifications();
  
  // Internal state for notification indicator if not provided from parent
  const hasUnreadNotifications = useMemo(() => {
    return unreadCount > 0;
  }, [unreadCount]);
  
  // Update parent component's state if provided
  useEffect(() => {
    if (setHasNotifications) {
      setHasNotifications(hasUnreadNotifications);
    }
  }, [hasUnreadNotifications, setHasNotifications]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-[#174c65]/90">
          <BellDot className="h-6 w-6" />
          {(hasNotifications !== undefined ? hasNotifications : hasUnreadNotifications) && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              disabled={isActionInProgress || unreadCount === 0}
              onClick={() => markAllAsRead()}
            >
              {isActionInProgress ? "..." : "Mark all as read"}
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px]">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={markAsRead}
                />
              ))}
            </ScrollArea>
            
            <div className="p-2 border-t text-center">
              <Button 
                variant="link" 
                className="text-blue-600 w-full" 
                onClick={() => navigate("/notifications")}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
