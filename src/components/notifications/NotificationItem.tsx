import React from 'react';
import { Notification, NotificationAction } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { MessageCircle, Eye, Reply, Check, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string | number) => void;
  compact?: boolean;
  onClick?: () => void;
}

const NotificationItem = ({ notification, onMarkAsRead, compact = false, onClick }: NotificationItemProps) => {
  const navigate = useNavigate();
  
  // Handle click on the entire notification
  const handleNotificationClick = () => {
    // Always mark as read when clicking on the notification
    onMarkAsRead(notification.id);
    
    // Call the onClick handler if provided
    if (onClick) {
      onClick();
    } else {
      // If no onClick provided, use default navigation behavior
      navigateToTarget(notification);
    }
  };
  
  // Navigation helper function based on notification type
  const navigateToTarget = (notification: Notification) => {
    console.log('[NotificationItem] Navigating based on notification type:', notification.type);
    
    switch (notification.type) {
      case 'message':
        if (notification.project?.id) {
          navigate(`/project-messages/${notification.project.id}`);
        }
        break;
        
      case 'sow_review':
        if (notification.project?.id) {
          navigate(`/project-sow/${notification.project.id}?review=true`);
        }
        break;
        
      case 'sow_approved':
        if (notification.project?.id) {
          navigate(`/project-manage/${notification.project.id}`);
        }
        break;
        
      case 'project_ready':
        if (notification.project?.id) {
          navigate(`/project-calendar/${notification.project.id}`);
        }
        break;
        
      case 'new_meeting':
        if (notification.project?.id) {
          console.log('[NotificationItem] Navigating to project calendar for meeting:', notification.meeting?.id);
          navigate(`/project-calendar/${notification.project.id}`);
        }
        break;
        
      case 'project_coaching_request':
        if (notification.project?.id) {
          console.log('[NotificationItem] Navigating to project coaching request:', notification.project.id);
          navigate(`/project-calendar/${notification.project.id}`);
        }
        break;
        
      default:
        console.log('[NotificationItem] No navigation defined for notification type:', notification.type);
        break;
    }
  };
  
  const handleAction = (action: NotificationAction, e: React.MouseEvent) => {
    // Prevent the click from bubbling up to the parent
    e.stopPropagation();
    
    // Always mark as read when an action is taken
    onMarkAsRead(notification.id);
    
    if (action === 'mark_as_read') {
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
        if (notification.project?.id) {
          // Update: Navigate to project calendar instead of calendar with event param
          console.log('[NotificationItem] Navigating to project calendar for meeting:', notification.meeting?.id);
          navigate(`/project-calendar/${notification.project.id}`);
        }
        break;
        
      case 'reschedule':
        if (notification.meeting?.id && notification.project?.id) {
          // Update: Navigate to project calendar with reschedule param
          navigate(`/project-calendar/${notification.project.id}?reschedule=true`);
        }
        break;
        
      default:
        break;
    }
  };
  
  const renderIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'new_meeting':
        return <Calendar className="h-4 w-4" />;
      case 'project_coaching_request':
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
            onClick={(e) => handleAction('view', e)}
          >
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
        )}
        
        {notification.availableActions.includes('reply') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={(e) => handleAction('reply', e)}
          >
            <Reply className="h-3 w-3 mr-1" /> Reply
          </Button>
        )}
        
        {notification.availableActions.includes('view_sow') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={(e) => handleAction('view_sow', e)}
          >
            <Eye className="h-3 w-3 mr-1" /> View SOW
          </Button>
        )}
        
        {notification.availableActions.includes('publish_project') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={(e) => handleAction('publish_project', e)}
          >
            <ArrowRight className="h-3 w-3 mr-1" /> Publish
          </Button>
        )}
        
        {notification.availableActions.includes('schedule_consultation') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={(e) => handleAction('schedule_consultation', e)}
          >
            <Calendar className="h-3 w-3 mr-1" /> Schedule
          </Button>
        )}
        
        {notification.availableActions.includes('view_meeting') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={(e) => handleAction('view_meeting', e)}
          >
            <Eye className="h-3 w-3 mr-1" /> View Meeting
          </Button>
        )}
        
        {notification.availableActions.includes('reschedule') && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={(e) => handleAction('reschedule', e)}
          >
            <Calendar className="h-3 w-3 mr-1" /> Reschedule
          </Button>
        )}
        
        {notification.availableActions.includes('mark_as_read') && !notification.read && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7 px-2 ml-auto"
            onClick={(e) => handleAction('mark_as_read', e)}
          >
            <Check className="h-3 w-3 mr-1" /> Mark read
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <div 
      className={`border-b p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
      onClick={handleNotificationClick}
    >
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            {notification.users && notification.users[0]?.avatar 
              ? notification.users[0].avatar 
              : notification.users && notification.users[0]?.name 
                ? notification.users[0].name.charAt(0).toUpperCase() 
                : '?'}
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
      
      {notification.type === "new_meeting" && (
        <div className="flex items-center mt-1 text-gray-500 text-xs">
          <Calendar className="h-4 w-4" /> <span className="ml-1">Meeting · {notification.project?.name}</span>
        </div>
      )}
      
      {notification.type === "project_coaching_request" && (
        <div className="flex items-center mt-1 text-gray-500 text-xs">
          <Calendar className="h-4 w-4" /> <span className="ml-1">Coaching Request · {notification.project?.name}</span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
