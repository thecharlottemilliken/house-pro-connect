
import { Notification } from '@/types/notifications';

/**
 * Provides mock notification data for demonstration purposes
 */
export const getMockNotifications = (): Notification[] => {
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
