
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

// This hook listens for SOW status changes and creates notifications
export const useSOWNotifications = () => {
  const { user, profile } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Set up subscription to statement_of_work table for changes
    const channel = supabase
      .channel('sow_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'statement_of_work'
        },
        async (payload) => {
          const oldSOW = payload.old;
          const newSOW = payload.new;
          
          // Skip if status didn't change
          if (oldSOW.status === newSOW.status) return;
          
          // Fetch project details including owner info
          const { data: projectData } = await supabase
            .from('projects')
            .select('title, user_id, id')
            .eq('id', newSOW.project_id)
            .single();
            
          if (!projectData) return;
          
          // Handle different notification scenarios based on role and status change
          
          // Case 1: SOW ready for review (resident notification)
          if (newSOW.status === 'ready for review' && projectData.user_id === user.id) {
            // Get coach info
            const { data: coachData } = await supabase
              .from('project_team_members')
              .select('name')
              .eq('project_id', projectData.id)
              .eq('role', 'coach')
              .maybeSingle();
              
            const coachName = coachData?.name || 'Your coach';
            
            toast('SOW Ready for Review', {
              description: `${coachName} has submitted an SOW for you to review for project "${projectData.title}".`
            });
          }
          
          // Case 2: SOW approved (coach notification)
          if (newSOW.status === 'approved' && profile?.role === 'coach') {
            // Get owner info
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', projectData.user_id)
              .single();
              
            const ownerName = ownerData?.name || 'The project owner';
            
            toast('SOW Approved', {
              description: `${ownerName} has approved the SOW for project "${projectData.title}".`
            });
          }
          
          // Case 3: SOW needs revision (coach notification)
          if (newSOW.status === 'pending revision' && profile?.role === 'coach') {
            // Get owner info
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', projectData.user_id)
              .single();
              
            const ownerName = ownerData?.name || 'The project owner';
            
            toast('SOW Needs Revision', {
              description: `${ownerName} has requested changes to the SOW for project "${projectData.title}".`
            });
          }
        }
      )
      .subscribe();
      
    // Clean up subscription  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);
};
