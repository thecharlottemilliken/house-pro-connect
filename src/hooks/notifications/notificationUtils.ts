
import { Notification, NotificationType } from '@/types/notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Formats a notification from the database into our application's Notification type
 */
export const formatNotificationFromDB = (dbNotification: any): Notification => {
  try {
    console.log('[notificationUtils] Formatting notification from DB:', dbNotification);
    
    // Parse the data JSON field which contains our structured data
    const data = dbNotification.data || {};
    
    return {
      id: dbNotification.id,
      type: dbNotification.type as NotificationType,
      title: dbNotification.title,
      content: dbNotification.content || undefined,
      date: new Date(dbNotification.date || dbNotification.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
    console.error('[notificationUtils] Error formatting notification:', error, dbNotification);
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

/**
 * Fetches notifications from the database for a given user
 */
export const fetchNotificationsFromDB = async (userId: string | undefined) => {
  if (!userId) return { data: [], error: new Error('No user ID provided') };

  try {
    console.log('[notificationUtils] Fetching notifications for user:', userId);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('[notificationUtils] Error in supabase query:', error);
      throw error;
    }
    
    // Log the results for debugging
    console.log(`[notificationUtils] Found ${data?.length || 0} notifications in database`);
    
    return { data, error: null };
  } catch (error) {
    console.error('[notificationUtils] Error fetching notifications:', error);
    return { data: [], error };
  }
};

/**
 * Mark a notification as read in the database
 */
export const markNotificationAsReadInDB = async (notificationId: string | number) => {
  try {
    // Convert the notificationId to string if it's a number
    const idAsString = notificationId.toString();
    
    console.log('[notificationUtils] Marking notification as read:', idAsString);
    
    // Update the database
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', idAsString);
    
    if (error) {
      console.error('[notificationUtils] Error updating notification in supabase:', error);
      throw error;
    }
    
    console.log('[notificationUtils] Successfully marked notification as read:', idAsString);
    return { success: true, error: null };
  } catch (error) {
    console.error('[notificationUtils] Error marking notification as read:', error);
    toast({
      title: "Error",
      description: "Failed to mark notification as read",
      variant: "destructive"
    });
    return { success: false, error };
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsReadInDB = async (userId: string | undefined) => {
  if (!userId) return { success: false, error: new Error('No user ID provided') };
  
  try {
    console.log('[notificationUtils] Marking all notifications as read for user:', userId);
    
    // Update the database
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('[notificationUtils] Error in supabase update:', error);
      throw error;
    }
    
    console.log('[notificationUtils] Successfully marked all notifications as read for user:', userId);
    return { success: true, error: null };
  } catch (error) {
    console.error('[notificationUtils] Error marking all notifications as read:', error);
    toast({
      title: "Error",
      description: "Failed to mark all notifications as read",
      variant: "destructive"
    });
    return { success: false, error };
  }
};

/**
 * Create a new notification
 */
export const createNotificationInDB = async (
  type: NotificationType,
  data: any,
  recipientId: string,
  notificationTemplates: any
) => {
  if (!notificationTemplates[type]) {
    console.error('[notificationUtils] No template found for notification type:', type);
    return null;
  }

  try {
    console.log(`[notificationUtils] Creating ${type} notification for user ${recipientId}`, data);
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
    
    console.log('[notificationUtils] Inserting notification data:', {
      recipient_id: recipientId,
      type,
      title,
      content,
      priority,
      data: jsonData
    });
    
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
    
    if (error) {
      console.error('[notificationUtils] Error creating notification in supabase:', error);
      throw error;
    }
    
    console.log('[notificationUtils] Successfully created notification:', newNotification);
    
    // Return the new notification
    return formatNotificationFromDB(newNotification);
  } catch (error) {
    console.error('[notificationUtils] Error creating notification:', error);
    return null;
  }
};
