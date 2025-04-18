
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export const useProjectMessages = (projectId: string, recipientId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!projectId || !recipientId || !user) return;

      try {
        const { data, error } = await supabase
          .from('project_messages')
          .select('*')
          .eq('project_id', projectId)
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [projectId, recipientId, user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId || !user) return;

    const channel = supabase
      .channel('project_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === recipientId || newMessage.recipient_id === recipientId) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, recipientId, user]);

  const sendMessage = async (message: string) => {
    if (!projectId || !recipientId || !user) return;

    try {
      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          sender_id: user.id,
          recipient_id: recipientId,
          message
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
};
