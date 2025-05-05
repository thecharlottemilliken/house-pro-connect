
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';

interface UseNotificationSubscriptionProps {
  userId?: string;
  onNewNotification: (notification: Notification) => void;
}

export const useNotificationSubscription = ({ 
  userId, 
  onNewNotification 
}: UseNotificationSubscriptionProps) => {
  useEffect(() => {
    if (!userId) return;
    
    console.log('[Notification Subscription] Setting up for user:', userId);
    
    const channel = supabase
      .channel(`user-notifications-${userId}`)
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
          
          // Format the notification to match our app's structure
          if (payload.new) {
            const notification: Notification = {
              id: payload.new.id,
              type: payload.new.type,
              title: payload.new.title,
              content: payload.new.content || undefined,
              date: payload.new.date,
              read: payload.new.read || false,
              users: payload.new.data?.users || [],
              project: payload.new.data?.project,
              meeting: payload.new.data?.meeting,
              message: payload.new.data?.message,
              sow: payload.new.data?.sow,
              priority: payload.new.priority || 'medium',
              availableActions: payload.new.data?.availableActions || [],
            };
            
            // Notify the parent component
            onNewNotification(notification);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Notification Subscription] Status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('[Notification Subscription] Successfully subscribed for user', userId);
        }
      });
      
    // Cleanup subscription when component unmounts
    return () => {
      console.log('[Notification Subscription] Removing subscription for user:', userId);
      supabase.removeChannel(channel);
    };
  }, [userId, onNewNotification]);
};
