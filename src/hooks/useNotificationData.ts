
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types/notifications'; 
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotificationsFromDB, formatNotificationFromDB } from './notifications/notificationUtils';
import { getMockNotifications } from './notifications/mockNotifications';

/**
 * Hook to fetch and manage notification data
 */
export const useNotificationData = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await fetchNotificationsFromDB(user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} notifications in database`);
        const formattedNotifications = data.map(formatNotificationFromDB);
        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter(n => !n.read).length);
      } else {
        console.log('No notifications found in DB, using mock data');
        // If no notifications in DB, use mock data for demonstration
        const mockNotifications = getMockNotifications();
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error in notification system:', error);
      // For demo purposes, still set mock data on error
      const mockNotifications = getMockNotifications();
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Add a new notification to the local state
  const addNotification = useCallback((newNotification: Notification) => {
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    setNotifications,
    setUnreadCount,
    fetchNotifications,
    addNotification
  };
};
