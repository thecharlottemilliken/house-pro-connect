import { NotificationTemplate, NotificationType } from "@/types/notifications";
import { formatDistanceToNow } from "date-fns";

export const notificationTemplates: Record<NotificationType, NotificationTemplate> = {
  message: {
    type: 'message',
    titleFormat: "[User] messaged you on [Date Message Sent]",
    contentFormat: "First 50-100 characters of the message",
    priority: 'high',
    defaultActions: ['view', 'reply', 'mark_as_read'],
    generateTitle: (data: { user: string; date: Date }) => {
      return `${data.user} messaged you ${formatDistanceToNow(data.date, { addSuffix: true })}`;
    },
    generateContent: (data: { message: string }) => {
      if (!data.message) return '';
      const maxLength = 100;
      return data.message.length > maxLength 
        ? `${data.message.substring(0, maxLength)}...` 
        : data.message;
    }
  },
  sow_review: {
    type: 'sow_review',
    titleFormat: "[Coach] has submitted an SOW for you to review.",
    contentFormat: "To continue the project you will need to review the SOW.",
    priority: 'high',
    defaultActions: ['view_sow', 'mark_as_read'],
    generateTitle: (data: { coach: string }) => {
      return `${data.coach} has submitted an SOW for you to review.`;
    },
    generateContent: () => {
      return "To continue the project you will need to review the SOW.";
    }
  },
  sow_approved: {
    type: 'sow_approved',
    titleFormat: "[Project Owner] has approved the [project name] SOW.",
    contentFormat: "Next, publish the project for bidding.",
    priority: 'high',
    defaultActions: ['publish_project', 'mark_as_read'],
    generateTitle: (data: { owner: string; project: string }) => {
      return `${data.owner} has approved the ${data.project} SOW.`;
    },
    generateContent: () => {
      return "Next, publish the project for bidding.";
    }
  },
  project_ready: {
    type: 'project_ready',
    titleFormat: "[Project Name] is ready for a consultation.",
    contentFormat: "Please select from the time slots to schedule",
    priority: 'high',
    defaultActions: ['schedule_consultation', 'mark_as_read'],
    generateTitle: (data: { project: string }) => {
      return `${data.project} is ready for a consultation.`;
    },
    generateContent: () => {
      return "Please select from the time slots to schedule.";
    }
  },
  new_meeting: {
    type: 'new_meeting',
    titleFormat: "[User] has invited you to [Meeting Name] on [Meeting date]",
    contentFormat: "Meeting description",
    priority: 'high',
    defaultActions: ['view_meeting', 'reschedule', 'mark_as_read'],
    generateTitle: (data: { user: string; meeting: string; date: string }) => {
      return `${data.user} has invited you to ${data.meeting} on ${data.date}`;
    },
    generateContent: (data: { description?: string }) => {
      if (!data.description) return '';
      const maxLength = 100;
      return data.description.length > maxLength 
        ? `${data.description.substring(0, maxLength)}...` 
        : data.description;
    }
  },
  project_coaching_request: {
    type: 'project_coaching_request',
    titleFormat: "New project [Project Name] needs coaching",
    contentFormat: "The resident has requested coaching help and provided time slots.",
    priority: 'high',
    defaultActions: ['schedule_consultation', 'mark_as_read'],
    generateTitle: (data: { project: string }) => {
      return `New project "${data.project}" needs coaching`;
    },
    generateContent: (data: { ownerName: string }) => {
      return `${data.ownerName} has requested coaching help and provided time slots. Please schedule a consultation.`;
    }
  }
};
