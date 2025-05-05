
import { useCallback } from 'react';
import { useNotificationData } from './useNotificationData';
import { useNotificationSubscription } from './notifications/useNotificationSubscription';
import { useNotificationActions } from './notifications/useNotificationActions';
import { useNotificationCreation } from './useNotificationCreation';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationType } from '@/types/notifications';

/**
 * Main notifications hook that combines all notification functionality
 */
export const useNotifications = () => {
  const { user } = useAuth();
  
  const {
    notifications,
    loading,
    unreadCount,
    setNotifications,
    setUnreadCount,
    fetchNotifications,
    addNotification
  } = useNotificationData();

  // Set up real-time notification subscription
  useNotificationSubscription({
    userId: user?.id,
    onNewNotification: addNotification
  });

  // Get notification actions
  const {
    markAsRead,
    markAllAsRead,
    isActionInProgress
  } = useNotificationActions({
    notifications,
    setNotifications,
    setUnreadCount,
    userId: user?.id
  });

  // Get notification creation functionality
  const { createNotification } = useNotificationCreation();

  // Function to manually refresh notifications
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    refreshNotifications,
    isActionInProgress,
    addNotification // Explicitly expose addNotification
  };
};
