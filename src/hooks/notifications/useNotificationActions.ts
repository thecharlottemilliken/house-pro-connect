
import { useState, useCallback } from 'react';
import { Notification } from '@/types/notifications';
import { markNotificationAsReadInDB, markAllNotificationsAsReadInDB } from './notificationUtils';

interface UseNotificationActionsProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  userId: string | undefined;
}

/**
 * Hook to manage notification actions (mark as read, mark all as read)
 */
export const useNotificationActions = ({
  notifications,
  setNotifications,
  setUnreadCount,
  userId
}: UseNotificationActionsProps) => {
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string | number) => {
    setIsActionInProgress(true);
    
    const { success } = await markNotificationAsReadInDB(notificationId);
    
    if (success) {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setIsActionInProgress(false);
  }, [setNotifications, setUnreadCount]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId || notifications.filter(n => !n.read).length === 0) return;
    
    setIsActionInProgress(true);
    
    const { success } = await markAllNotificationsAsReadInDB(userId);
    
    if (success) {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    }
    
    setIsActionInProgress(false);
  }, [userId, notifications, setNotifications, setUnreadCount]);

  return { 
    markAsRead, 
    markAllAsRead, 
    isActionInProgress 
  };
};
