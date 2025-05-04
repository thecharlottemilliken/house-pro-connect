
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types/notifications'; 
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotificationsFromDB, formatNotificationFromDB } from './notifications/notificationUtils';
import { getMockNotifications } from './notifications/mockNotifications';

/**
 * Flag to enable/disable mock notifications when no real ones exist
 * Set to false in production
 */
const USE_MOCK_FALLBACK = false;

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
      
      console.log('[useNotificationData] Fetching notifications for user:', user.id);
      const { data, error } = await fetchNotificationsFromDB(user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`[useNotificationData] Found ${data.length} notifications in database`);
        const formattedNotifications = data.map(formatNotificationFromDB);
        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter(n => !n.read).length);
      } else {
        console.log('[useNotificationData] No notifications found in DB');
        
        if (USE_MOCK_FALLBACK) {
          console.log('[useNotificationData] Using mock data for demonstration');
          const mockNotifications = getMockNotifications();
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.read).length);
        } else {
          // Just set empty array when there's no notifications
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('[useNotificationData] Error fetching notifications:', error);
      
      if (USE_MOCK_FALLBACK) {
        console.log('[useNotificationData] Using mock data due to error');
        // For demo purposes, still set mock data on error
        const mockNotifications = getMockNotifications();
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } else {
        // Just set empty array when there's an error
        setNotifications([]);
        setUnreadCount(0);
      }
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
    console.log('[useNotificationData] Adding notification to state:', newNotification);
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
