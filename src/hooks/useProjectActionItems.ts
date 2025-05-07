
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Define the ActionItem interface explicitly to avoid type issues
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
        
        // Since we're using raw SQL for queries to avoid TypeScript issues with the new table
        const { data, error: queryError } = await supabase
          .from('project_action_items')
          .select('*')
          .eq('project_id', projectId)
          .eq('completed', false)
          .order('created_at', { ascending: false });
          
        if (queryError) throw queryError;

        // For coaches, fetch all action items
        // For owners or team members, fetch only relevant items
        let filteredItems = data || [];
        if (userRole !== 'coach') {
          filteredItems = filteredItems.filter(item => 
            item.for_role === userRole || item.for_role === null
          );
        }
        
        setActionItems(filteredItems as ActionItem[]);
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
      // Using raw SQL to avoid TypeScript issues
      const { error: updateError } = await supabase
        .rpc('update_action_item_completion', { 
          item_id: itemId,
          is_completed: true
        })
        .select();
      
      if (updateError) {
        // Fallback to direct update if RPC fails
        const { error } = await supabase
          .from('project_action_items')
          .update({
            completed: true,
            completion_date: new Date().toISOString()
          })
          .eq('id', itemId);
        
        if (error) throw error;
      }
      
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
