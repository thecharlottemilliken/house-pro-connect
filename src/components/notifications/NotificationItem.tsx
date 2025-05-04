
import React from 'react';
import { Notification, NotificationAction } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { MessageCircle, Eye, Reply, Check, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string | number) => void;
  compact?: boolean;
}

const NotificationItem = ({ notification, onMarkAsRead, compact = false }: NotificationItemProps) => {
  const navigate = useNavigate();
  
  const handleAction = (action: NotificationAction) => {
    if (action === 'mark_as_read') {
      onMarkAsRead(notification.id);
      return;
    }
    
    // Handle other actions based on notification type
    switch (action) {
      case 'view':
        if (notification.type === 'message' && notification.project?.id) {
          navigate(`/project-messages/${notification.project.id}`);
        }
        break;
      
      case 'reply':
        if (notification.type === 'message' && notification.project?.id) {
          navigate(`/project-messages/${notification.project.id}`);
        }
        break;
        
      case 'view_sow':
        if (notification.project?.id) {
          navigate(`/project-sow/${notification.project.id}?review=true`);
        }
        break;
        
      case 'publish_project':
        if (notification.project?.id) {
          navigate(`/project-manage/${notification.project.id}`);
        }
        break;
        
      case 'schedule_consultation':
        if (notification.project?.id) {
          navigate(`/project-calendar/${notification.project.id}`);
        }
        break;
        
      case 'view_meeting':
        if (notification.meeting?.id) {
          navigate(`/calendar?event=${notification.meeting.id}`);
        }
        break;
        
      case 'reschedule':
        if (notification.meeting?.id) {
          navigate(`/calendar?event=${notification.meeting.id}&reschedule=true`);
        }
        break;
        
      default:
        break;
    }
    
    // Always mark as read when an action is taken
    onMarkAsRead(notification.id);
  };
  
  const renderIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'new_meeting':
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const renderActions = () => {
    if (compact) return null;
    
    return (
      <div className="flex gap-2 mt-2">
        {notification.availableActions.includes('view') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleAction('view')}
          >
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
        )}
        
        {notification.availableActions.includes('reply') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleAction('reply')}
          >
            <Reply className="h-3 w-3 mr-1" /> Reply
          </Button>
        )}
        
        {notification.availableActions.includes('view_sow') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleAction('view_sow')}
          >
            <Eye className="h-3 w-3 mr-1" /> View SOW
          </Button>
        )}
        
        {notification.availableActions.includes('publish_project') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleAction('publish_project')}
          >
            <ArrowRight className="h-3 w-3 mr-1" /> Publish
          </Button>
        )}
        
        {notification.availableActions.includes('schedule_consultation') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleAction('schedule_consultation')}
          >
            <Calendar className="h-3 w-3 mr-1" /> Schedule
          </Button>
        )}
        
        {notification.availableActions.includes('view_meeting') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleAction('view_meeting')}
          >
            <Eye className="h-3 w-3 mr-1" /> View Meeting
          </Button>
        )}
        
        {notification.availableActions.includes('reschedule') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => handleAction('reschedule')}
          >
            <Calendar className="h-3 w-3 mr-1" /> Reschedule
          </Button>
        )}
        
        {notification.availableActions.includes('mark_as_read') && !notification.read && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7 px-2 ml-auto"
            onClick={() => handleAction('mark_as_read')}
          >
            <Check className="h-3 w-3 mr-1" /> Mark read
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <div 
      className={`border-b p-3 hover:bg-gray-50 ${compact ? '' : 'cursor-pointer'}`}
      onClick={compact ? undefined : () => !notification.read && handleAction('mark_as_read')}
    >
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            {notification.users[0]?.avatar || notification.users[0]?.name[0]}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">
              {notification.title}
            </div>
            {notification.content && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{notification.content}</p>
            )}
            
            {renderActions()}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">{notification.date}</span>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
          )}
        </div>
      </div>
      
      {notification.type === "message" && renderIcon() && (
        <div className="flex items-center mt-1 text-gray-500 text-xs">
          {renderIcon()} <span className="ml-1">Message · {notification.project?.name}</span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
