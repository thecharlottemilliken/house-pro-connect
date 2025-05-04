
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Settings, MessageCircle } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    users: [{ name: "Jarett King", avatar: "J" }, { name: "Adrinn", avatar: "A" }],
    commentCount: 76,
    project: "High-Fidelity",
    date: "Apr 1",
    read: false
  },
  {
    id: 2,
    users: [{ name: "Adrinn", avatar: "A" }],
    commentCount: 15,
    project: "Rehab Squared Design System",
    date: "Mar 20",
    read: false
  },
  {
    id: 3,
    users: [{ name: "Jarett King", avatar: "J" }],
    type: "comment",
    project: "Wireframes",
    date: "Mar 14",
    read: false,
    content: "I might eliminate this option in the initial atm. But I can confirm after a collaborative chat w/you on the pro dashboard layout/design"
  },
  {
    id: 4,
    users: [{ name: "Jarett King", avatar: "J" }],
    type: "comment",
    project: "Wireframes",
    date: "Mar 14",
    read: false,
    content: "Before interior and exterior selections we need to implement your comment related to the four gtm renovation services: kitchen only, kitchen & baths,..."
  },
];

const Notifications = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread'>('all');
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <div className="flex gap-4">
          <button 
            className={`px-3 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-2 ${activeTab === 'unread' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>
        <button className="text-blue-500">
          Mark all as read
        </button>
      </div>
      
      <div className="space-y-4">
        {mockNotifications.map((notification) => (
          <div key={notification.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                  {notification.users[0].avatar}
                </div>
                <div>
                  <div className="font-medium">
                    {notification.users.map((u, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && " and "}{u.name}
                      </React.Fragment>
                    ))}
                    {notification.type === "comment" && 
                      <span className="text-gray-700"> commented</span>
                    }
                    {!notification.type && notification.commentCount && 
                      <span className="text-gray-700"> · {notification.commentCount} comments</span>
                    }
                    {notification.project && 
                      <span className="text-gray-700"> · {notification.project}</span>
                    }
                  </div>
                  {notification.content && (
                    <p className="text-gray-600 mt-1">{notification.content}</p>
                  )}
                  {notification.type === "comment" && (
                    <div className="flex items-center mt-2 text-gray-500 text-sm">
                      <MessageCircle className="h-4 w-4 mr-1" /> Commented · Wireframes
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {notification.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
