
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread'>('all');
  const { user } = useAuth();
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications
  } = useNotifications();

  // Set up real-time subscription to notifications for this page
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications_page_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
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
  
  return (
    <>
      <DashboardNavbar />
      <div className="container max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <div className="flex gap-4">
            <button 
              className={cn(
                "px-3 py-2", 
                activeTab === 'all' ? "border-b-2 border-blue-500 font-medium" : ""
              )}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={cn(
                "px-3 py-2", 
                activeTab === 'unread' ? "border-b-2 border-blue-500 font-medium" : ""
              )}
              onClick={() => setActiveTab('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <button 
            className="text-blue-500"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {activeTab === 'all' 
                ? "No notifications" 
                : "No unread notifications"}
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border">
              {filteredNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
