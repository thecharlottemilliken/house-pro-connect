
import { useCallback } from 'react';
import { NotificationType } from '@/types/notifications';
import { notificationTemplates } from '@/lib/notificationTemplates';
import { createNotificationInDB } from './notifications/notificationUtils';

/**
 * Hook to create new notifications
 */
export const useNotificationCreation = () => {
  // Create a notification function (would be used by other parts of the app)
  const createNotification = useCallback(async (
    type: NotificationType,
    data: any,
    recipientId: string
  ) => {
    return createNotificationInDB(type, data, recipientId, notificationTemplates);
  }, []);

  return { createNotification };
};
