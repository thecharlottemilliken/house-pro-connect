
import { NotificationTemplate } from "@/types/notifications";

export const notificationTemplates: Record<string, NotificationTemplate> = {
  message: {
    type: 'message',
    titleFormat: '{user} messaged you',
    contentFormat: '{content}',
    priority: 'medium',
    defaultActions: ['view', 'reply', 'mark_as_read'],
    generateTitle: (data) => {
      return `${data.user} messaged you`;
    },
    generateContent: (data) => {
      return data.content || '';
    }
  },
  
  sow_review: {
    type: 'sow_review',
    titleFormat: '{user} has submitted an SOW for you to review',
    contentFormat: 'To continue the project you will need to review the SOW.',
    priority: 'high',
    defaultActions: ['view_sow', 'mark_as_read'],
    generateTitle: (data) => {
      return `${data.user} has submitted an SOW for you to review`;
    },
    generateContent: () => {
      return 'To continue the project you will need to review the SOW.';
    }
  },
  
  sow_approved: {
    type: 'sow_approved',
    titleFormat: '{user} has approved the {project} SOW',
    contentFormat: 'Next, publish the project for bidding.',
    priority: 'high',
    defaultActions: ['publish_project', 'mark_as_read'],
    generateTitle: (data) => {
      return `${data.user} has approved the ${data.project} SOW`;
    },
    generateContent: () => {
      return 'Next, publish the project for bidding.';
    }
  },
  
  project_ready: {
    type: 'project_ready',
    titleFormat: 'Project {project} is ready for review',
    contentFormat: 'The project is complete and ready for your review.',
    priority: 'medium',
    defaultActions: ['view', 'mark_as_read'],
    generateTitle: (data) => {
      return `Project ${data.project} is ready for review`;
    },
    generateContent: () => {
      return 'The project is complete and ready for your review.';
    }
  },
  
  new_meeting: {
    type: 'new_meeting',
    titleFormat: '{user} has invited you to {meeting} on {date}',
    contentFormat: '{description}',
    priority: 'high',
    defaultActions: ['view_meeting', 'reschedule', 'mark_as_read'],
    generateTitle: (data) => {
      return `${data.user} has invited you to ${data.meeting} on ${data.date}`;
    },
    generateContent: (data) => {
      return data.description || '';
    }
  },
  
  project_coaching_request: {
    type: 'project_coaching_request',
    titleFormat: 'New project "{project}" needs coaching',
    contentFormat: '{user} has requested coaching help and provided time slots. Please schedule a consultation.',
    priority: 'high',
    defaultActions: ['schedule_consultation', 'mark_as_read'],
    generateTitle: (data) => {
      return `New project "${data.project}" needs coaching`;
    },
    generateContent: (data) => {
      return `${data.user} has requested coaching help and provided time slots. Please schedule a consultation.`;
    }
  }
};
