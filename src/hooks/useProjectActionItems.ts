
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  icon_name: string | null;
  action_type: string;
  action_data: any;
  completed: boolean;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
  for_role: string | null;
  project_id: string;
}

export const useProjectActionItems = (projectId: string) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useAuth();
  
  useEffect(() => {
    const fetchActionItems = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const userRole = profile?.role || '';
        
        // For coaches, fetch all action items
        // For owners or team members, fetch items relevant to their role
        const query = supabase
          .from('project_action_items')
          .select('*')
          .eq('project_id', projectId)
          .eq('completed', false)
          .order('created_at', { ascending: false });
          
        // If user is not a coach, filter by role
        if (userRole !== 'coach') {
          query.or(`for_role.eq.${userRole},for_role.is.null`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setActionItems(data as ActionItem[]);
      } catch (err: any) {
        console.error("Error fetching action items:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActionItems();
  }, [projectId, profile]);
  
  const markActionItemComplete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('project_action_items')
        .update({ 
          completed: true,
          completion_date: new Date().toISOString()
        })
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update local state
      setActionItems(prev => prev.filter(item => item.id !== itemId));
      
      toast.success("Action item marked as completed");
      return true;
    } catch (err) {
      console.error("Error marking action item as complete:", err);
      toast.error("Failed to update action item");
      return false;
    }
  };
  
  return {
    actionItems,
    isLoading,
    error,
    markActionItemComplete
  };
};
