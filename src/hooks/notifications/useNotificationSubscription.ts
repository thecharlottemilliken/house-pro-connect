
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatNotificationFromDB } from './notificationUtils';
import { Notification } from '@/types/notifications';

interface UseNotificationSubscriptionProps {
  userId: string | undefined;
  onNewNotification: (notification: Notification) => void;
}

/**
 * Hook to subscribe to real-time notification updates
 */
export const useNotificationSubscription = ({ 
  userId, 
  onNewNotification 
}: UseNotificationSubscriptionProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    console.log('Setting up notification subscription in useNotificationSubscription hook');
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('use_notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received in subscription hook:', payload);
          const newNotification = formatNotificationFromDB(payload.new);
          
          // Call the callback
          onNewNotification(newNotification);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.content || '',
          });
        }
      )
      .subscribe();
    
    // Update subscription state
    setIsSubscribed(true);
    
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [userId, onNewNotification]);

  return { isSubscribed };
};
