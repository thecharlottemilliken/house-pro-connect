
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Notification, NotificationType } from '@/types/notifications';
import { toast } from '@/hooks/use-toast';
import { notificationTemplates } from '@/lib/notificationTemplates';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching notifications for user:', user.id);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('date', { ascending: false });
      
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

  // Set up real-time subscription to notifications
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up notification subscription in useNotifications hook');
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('use_notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received in hook:', payload);
          const newNotification = formatNotificationFromDB(payload.new);
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.content || '',
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Initial fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Helper to format data from DB to our Notification type
  const formatNotificationFromDB = (dbNotification: any): Notification => {
    try {
      // Parse the data JSON field which contains our structured data
      const data = dbNotification.data || {};
      
      return {
        id: dbNotification.id,
        type: dbNotification.type as NotificationType,
        title: dbNotification.title,
        content: dbNotification.content || undefined,
        date: new Date(dbNotification.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        read: dbNotification.read,
        users: data.users || [],
        priority: dbNotification.priority as 'high' | 'medium' | 'low',
        availableActions: data.availableActions || [],
        ...(data.project && { project: data.project }),
        ...(data.message && { message: data.message }),
        ...(data.meeting && { meeting: data.meeting }),
        ...(data.sow && { sow: data.sow }),
      };
    } catch (error) {
      console.error('Error formatting notification:', error, dbNotification);
      // Return a minimal valid notification if there's an error
      return {
        id: dbNotification.id || 'error-id',
        type: 'message',
        title: 'Error processing notification',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        read: false,
        users: [],
        priority: 'medium',
        availableActions: ['mark_as_read'],
      };
    }
  };

  // Function to manually refresh notifications
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string | number) => {
    try {
      // Convert the notificationId to string if it's a number
      const idAsString = notificationId.toString();
      
      // Update the database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', idAsString);
      
      if (error) throw error;
      
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user || notifications.filter(n => !n.read).length === 0) return;
    
    try {
      // Update the database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  // Create a notification function (would be used by other parts of the app)
  const createNotification = async (
    type: NotificationType,
    data: any,
    recipientId: string
  ) => {
    if (!notificationTemplates[type]) return null;

    try {
      const template = notificationTemplates[type];
      
      // Prepare the data for DB insertion
      const title = template.generateTitle(data);
      const content = template.generateContent(data);
      const priority = template.priority;
      
      // Create JSON data object with all the structured data
      const jsonData: any = {};
      
      // Add users array
      if (data.users) {
        jsonData.users = data.users;
      } else if (data.user) {
        jsonData.users = [{
          id: data.user.id || 'unknown',
          name: data.user,
          avatar: data.user.substring(0, 1)
        }];
      }
      
      // Add other data elements
      if (data.project) jsonData.project = data.project;
      if (data.meeting) jsonData.meeting = data.meeting;
      if (data.message) jsonData.message = data.message;
      if (data.sow) jsonData.sow = data.sow;
      
      // Add available actions
      jsonData.availableActions = template.defaultActions;
      
      // Insert into the database
      const { data: newNotification, error } = await supabase
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          type,
          title,
          content,
          priority,
          data: jsonData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Return the new notification
      return formatNotificationFromDB(newNotification);
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  // For demo purposes - get mock notifications
  const getMockNotifications = (): Notification[] => {
    return [
      {
        id: 1,
        type: 'message',
        title: 'Jarett King messaged you',
        content: "I might eliminate this option in the initial atm. But I can confirm after a collaborative chat w/you on the pro dashboard layout/design",
        date: 'Apr 1',
        read: false,
        users: [{ id: 'j1', name: 'Jarett King', avatar: 'J' }],
        project: { id: 'p1', name: 'High-Fidelity' },
        priority: 'high',
        availableActions: ['view', 'reply', 'mark_as_read']
      },
      {
        id: 2,
        type: 'sow_review',
        title: 'Adrinn has submitted an SOW for you to review',
        content: 'To continue the project you will need to review the SOW.',
        date: 'Mar 28',
        read: false,
        users: [{ id: 'a1', name: 'Adrinn', avatar: 'A' }],
        project: { id: 'p2', name: 'Rehab Squared Design System' },
        sow: { id: 's1' },
        priority: 'high',
        availableActions: ['view_sow', 'mark_as_read']
      },
      {
        id: 3,
        type: 'sow_approved',
        title: 'Charlotte Milliken has approved the Wireframes SOW',
        content: 'Next, publish the project for bidding.',
        date: 'Mar 22',
        read: false,
        users: [{ id: 'c1', name: 'Charlotte Milliken', avatar: 'C' }],
        project: { id: 'p3', name: 'Wireframes' },
        priority: 'high',
        availableActions: ['publish_project', 'mark_as_read']
      },
      {
        id: 4,
        type: 'project_coaching_request',
        title: 'Kitchen Renovation is ready for a consultation',
        content: 'Please select from the time slots to schedule.',
        date: 'Mar 20',
        read: false,
        users: [{ id: 'u1', name: 'Charlotte Milliken', avatar: 'C' }],
        project: { id: 'p4', name: 'Kitchen Renovation' },
        priority: 'high',
        availableActions: ['schedule_consultation', 'mark_as_read']
      },
      {
        id: 5,
        type: 'new_meeting',
        title: 'Jarett King has invited you to Initial Consult on Apr 10',
        content: 'Discussion about project scope and requirements. Please bring any reference materials you might have.',
        date: 'Mar 15',
        read: true,
        users: [{ id: 'j1', name: 'Jarett King', avatar: 'J' }],
        meeting: { id: 'm1', name: 'Initial Consult', date: 'Apr 10, 2:00 PM' },
        priority: 'high',
        availableActions: ['view_meeting', 'reschedule', 'mark_as_read']
      }
    ];
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    refreshNotifications
  };
};
