
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BellDot, ChevronDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationsPopoverProps {
  hasNotifications?: boolean;
  setHasNotifications?: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationsPopover = ({ hasNotifications, setHasNotifications }: NotificationsPopoverProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread'>('all');
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications
  } = useNotifications();
  
  const { user } = useAuth();
  
  // Sync the unreadCount with the parent component's state if provided
  React.useEffect(() => {
    if (setHasNotifications) {
      setHasNotifications(unreadCount > 0);
    }
  }, [unreadCount, setHasNotifications]);

  // Set up real-time subscription to notifications
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up notification subscription for user:', user.id);
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received in popover:', payload);
          // Refresh notifications to get the latest data
          refreshNotifications();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshNotifications]);

  // Filter notifications based on active tab
  const filteredNotifications = React.useMemo(() => {
    return activeTab === 'all' 
      ? notifications 
      : notifications.filter(n => !n.read);
  }, [notifications, activeTab]);

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleNotificationClick = () => {
    // Close the popover when a notification is clicked
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full text-white hover:bg-[#174c65]/90 relative"
        >
          <BellDot className="h-6 w-6" />
          {(hasNotifications !== undefined ? hasNotifications : unreadCount > 0) && (
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
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
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {activeTab === 'all' 
                ? "No notifications" 
                : "No unread notifications"}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkAsRead={markAsRead}
                compact
              />
            ))
          )}
        </div>
        
        <div className="p-3 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-center"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
