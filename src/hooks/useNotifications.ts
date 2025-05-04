
import { useState, useEffect } from 'react';
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

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // For now, we'll use mock data since the notifications table doesn't exist yet
        // In the future, we'll create a notifications table and fetch from there
        const mockNotifications = getMockNotifications();
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error in notification system:', error);
        // For demo purposes, still set mock data on error
        const mockNotifications = getMockNotifications();
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string | number) => {
    try {
      // In a real app, update the database
      // For now, just update the local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // TODO: In a real app, call the API to mark as read
      // await supabase
      //  .from('notifications')
      //  .update({ read: true })
      //  .eq('id', notificationId);
      
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
    try {
      // In a real app, update the database
      // For now, just update the local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // TODO: In a real app, call the API to mark all as read
      // await supabase
      //  .from('notifications')
      //  .update({ read: true })
      //  .eq('recipient_id', user.id);
      
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
      
      const notification: Omit<Notification, 'id'> = {
        type,
        title: template.generateTitle(data),
        content: template.generateContent(data),
        date: new Date().toISOString(),
        read: false,
        users: data.users || [],
        priority: template.priority,
        availableActions: template.defaultActions,
      };

      if (data.project) notification.project = data.project;
      if (data.meeting) notification.meeting = data.meeting;
      if (data.message) notification.message = data.message;
      if (data.sow) notification.sow = data.sow;

      // In a real app, this would be saved to the database
      // For now, we'll just return the notification object
      // which could be used to update local state
      
      // TODO: In a real app, save to database
      // const { data: savedNotification, error } = await supabase
      //   .from('notifications')
      //   .insert({
      //     ...notification,
      //     recipient_id: recipientId
      //   })
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return savedNotification;
      
      return {
        ...notification,
        id: Date.now().toString() // Mock ID for now
      };
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
        type: 'project_ready',
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
    createNotification
  };
};
