
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
    
    console.log('Setting up notification subscription in useNotificationSubscription hook for user:', userId);
    
    // Use a consistent channel name format for all notification subscriptions
    const channelName = `notifications_subscription_${userId}`;
    
    // Subscribe to new notifications
    const channel = supabase
      .channel(channelName)
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
          try {
            const newNotification = formatNotificationFromDB(payload.new);
            
            // Call the callback
            onNewNotification(newNotification);
            
            // Show toast for new notification
            toast({
              title: newNotification.title,
              description: newNotification.content || '',
            });
          } catch (error) {
            console.error('Error processing new notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Notification subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to notifications for user ${userId}`);
          setIsSubscribed(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to notification channel');
        }
      });
    
    return () => {
      console.log(`Removing notification subscription for user ${userId}`);
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [userId, onNewNotification]);

  return { isSubscribed };
};
