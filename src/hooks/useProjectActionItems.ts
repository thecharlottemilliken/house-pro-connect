
import { useState, useEffect, useCallback } from 'react';
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
  
  // Define fetchActionItems as a callback so we can reuse it
  const fetchActionItems = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userRole = profile?.role || '';
      console.log(`Fetching action items for user with role: ${userRole}`);
      
      // Fetch using the supabase client
      const { data: rawData, error: fetchError } = await supabase
        .from('project_action_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('completed', false)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      console.log("All action items before filtering:", rawData);
      
      // Cast the raw data to our ActionItem interface
      const typedData = rawData as ActionItem[];
      
      // Filter items based on user role
      let filteredItems = typedData || [];
      if (userRole) {
        // Filter items to show only those for the user's role or those without a specific role
        filteredItems = filteredItems.filter(item => 
          !item.for_role || item.for_role === userRole
        );
      }
      
      console.log(`Filtered ${typedData.length} action items to ${filteredItems.length} for role ${userRole}`);
      setActionItems(filteredItems);
    } catch (err: any) {
      console.error("Error fetching action items:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, profile]);
  
  // Call fetchActionItems on mount and when dependencies change
  useEffect(() => {
    fetchActionItems();
  }, [fetchActionItems]);
  
  const markActionItemComplete = async (itemId: string) => {
    try {
      // Use the RPC function we created
      const { data, error } = await supabase
        .rpc('update_action_item_completion', { 
          item_id: itemId, 
          is_completed: true 
        });
      
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
  
  // Add a refetch method that calls fetchActionItems
  const refetch = useCallback(async () => {
    return fetchActionItems();
  }, [fetchActionItems]);
  
  return {
    actionItems,
    isLoading,
    error,
    markActionItemComplete,
    refetch
  };
};
