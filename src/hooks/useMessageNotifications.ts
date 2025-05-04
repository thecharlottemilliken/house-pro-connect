
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from './use-toast';

// This hook listens for new project messages and creates notifications
export const useMessageNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set up subscription to project_messages table
    const channel = supabase
      .channel('message_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // Fetch sender details
          const { data: senderData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', newMessage.sender_id)
            .single();
            
          // Fetch project details
          const { data: projectData } = await supabase
            .from('projects')
            .select('title')
            .eq('id', newMessage.project_id)
            .single();
            
          const senderName = senderData?.name || 'Someone';
          const projectTitle = projectData?.title || 'a project';
          
          // Show toast notification
          toast({
            title: `New message from ${senderName}`,
            description: `${newMessage.message.substring(0, 60)}${newMessage.message.length > 60 ? '...' : ''}`,
          });
          
          // In a real implementation, you would create a notification record here
          // This is just a placeholder for how you'd create the notification
          /*
          await supabase
            .from('notifications')
            .insert({
              recipient_id: user.id,
              type: 'message',
              title: `${senderName} messaged you`,
              content: newMessage.message,
              related_id: newMessage.id,
              project_id: newMessage.project_id,
              sender_id: newMessage.sender_id,
              read: false,
              created_at: new Date().toISOString()
            });
          */
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};
