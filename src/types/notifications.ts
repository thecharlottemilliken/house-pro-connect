
export type NotificationType = 
  | 'message' 
  | 'sow_review' 
  | 'sow_approved' 
  | 'sow_revised'
  | 'sow_revision_requested'
  | 'project_ready' 
  | 'new_meeting'
  | 'project_coaching_request';

export type NotificationAction = 
  | 'view' 
  | 'reply' 
  | 'mark_as_read' 
  | 'schedule_consultation' 
  | 'publish_project' 
  | 'view_sow' 
  | 'view_meeting' 
  | 'reschedule';

export type NotificationPriority = 'high' | 'medium' | 'low';

export interface NotificationUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface Notification {
  id: number | string;
  type: NotificationType;
  title: string;
  content?: string;
  date: string;
  read: boolean;
  users: NotificationUser[];
  project?: {
    id: string;
    name: string;
  };
  meeting?: {
    id: string;
    name: string;
    date: string;
  };
  message?: {
    id: string;
    content: string;
  };
  sow?: {
    id: string;
    feedback?: string;
  };
  priority: NotificationPriority;
  availableActions: NotificationAction[];
}

export interface NotificationTemplate {
  type: NotificationType;
  titleFormat: string;
  contentFormat: string;
  priority: NotificationPriority;
  defaultActions: NotificationAction[];
  generateTitle: (data: any) => string;
  generateContent: (data: any) => string;
}
