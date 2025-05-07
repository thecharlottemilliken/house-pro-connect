
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
        
        // Use raw SQL query to avoid TypeScript issues
        const { data, error: queryError } = await supabase.rpc(
          'execute_sql',
          { 
            query: `
              SELECT * FROM project_action_items 
              WHERE project_id = '${projectId}' 
              AND completed = false 
              ORDER BY created_at DESC
            `
          }
        ).returns<ActionItem[]>();
          
        if (queryError) {
          // Fallback to using direct SQL
          const { data: rawData, error: rawError } = await supabase
            .from('project_action_items')
            .select('*')
            .eq('project_id', projectId)
            .eq('completed', false)
            .order('created_at', { ascending: false });
            
          if (rawError) throw rawError;
          
          // Type cast the result since TypeScript doesn't know the table structure
          const typedData = rawData as unknown as ActionItem[];
          
          // For coaches, fetch all action items
          // For owners or team members, fetch only relevant items
          let filteredItems = typedData || [];
          if (userRole !== 'coach') {
            filteredItems = filteredItems.filter(item => 
              item.for_role === userRole || item.for_role === null
            );
          }
          
          setActionItems(filteredItems);
        } else {
          // For coaches, fetch all action items
          // For owners or team members, fetch only relevant items
          let filteredItems = data || [];
          if (userRole !== 'coach') {
            filteredItems = filteredItems.filter(item => 
              item.for_role === userRole || item.for_role === null
            );
          }
          
          setActionItems(filteredItems);
        }
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
      // Call the RPC function we created
      const { data, error } = await supabase.rpc(
        'update_action_item_completion',
        { 
          item_id: itemId,
          is_completed: true
        }
      );
      
      if (error) {
        // Fallback to direct update if RPC fails
        const { error: fallbackError } = await supabase.from('project_action_items')
          .update({
            completed: true,
            completion_date: new Date().toISOString()
          })
          .eq('id', itemId);
          
        if (fallbackError) throw fallbackError;
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
