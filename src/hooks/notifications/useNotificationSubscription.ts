
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
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    console.log('[Notification Subscription] Setting up for user:', userId);
    
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
          console.log('[Notification Subscription] New notification received:', payload);
          try {
            const newNotification = formatNotificationFromDB(payload.new);
            console.log('[Notification Subscription] Formatted notification:', newNotification);
            
            // Call the callback
            onNewNotification(newNotification);
            
            // Show toast for new notification
            toast({
              title: newNotification.title,
              description: newNotification.content || '',
            });
          } catch (error) {
            console.error('[Notification Subscription] Error processing notification:', error);
            setError(error instanceof Error ? error : new Error(String(error)));
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Notification Subscription] Status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log(`[Notification Subscription] Successfully subscribed for user ${userId}`);
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Notification Subscription] Error subscribing to channel');
          setError(new Error('Failed to subscribe to notification channel'));
        }
      });
    
    return () => {
      console.log(`[Notification Subscription] Removing subscription for user ${userId}`);
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [userId, onNewNotification]);

  return { isSubscribed, error };
};
