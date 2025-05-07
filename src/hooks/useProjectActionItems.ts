
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
        
        // Use a direct fetch query with string interpolation to avoid TypeScript limitations
        // We cast the response type to any and then map to our ActionItem interface
        const { data: rawData, error: fetchError } = await supabase
          .from('project_action_items')
          .select('*')
          .eq('project_id', projectId)
          .eq('completed', false)
          .order('created_at', { ascending: false }) as { data: any, error: any };
            
        if (fetchError) throw fetchError;
        
        // Cast the raw data to our ActionItem interface
        const typedData = rawData as ActionItem[];
        
        // Filter items based on user role
        let filteredItems = typedData || [];
        if (userRole !== 'coach') {
          filteredItems = filteredItems.filter(item => 
            item.for_role === userRole || item.for_role === null
          );
        }
        
        setActionItems(filteredItems);
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
      // Direct update using string interpolation to avoid TypeScript limitations
      const { error } = await supabase
        .from('project_action_items')
        .update({
          completed: true,
          completion_date: new Date().toISOString()
        })
        .eq('id', itemId) as { error: any };
        
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
