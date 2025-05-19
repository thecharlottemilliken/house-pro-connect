
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
        console.log(`Fetching action items for user with role: ${userRole}`);
        
        // Use REST API directly to avoid TypeScript issues
        const response = await fetch(
          `https://gluggyghzalabvlvwqqk.supabase.co/rest/v1/project_action_items?project_id=eq.${projectId}&completed=eq.false&order=created_at.desc`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWdneWdoemFsYWJ2bHZ3cXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjIwNzQsImV4cCI6MjA1OTEzODA3NH0._EgQrKqGcedVgtHlDr3kCR7x6yzD8eaQ0ZvuQ0c7m08',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWdneWdoemFsYWJ2bHZ3cXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjIwNzQsImV4cCI6MjA1OTEzODA3NH0._EgQrKqGcedVgtHlDr3kCR7x6yzD8eaQ0ZvuQ0c7m08`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) throw new Error('Failed to fetch action items');
        
        const rawData = await response.json();
        console.log("All action items before filtering:", rawData);
        
        // Cast the raw data to our ActionItem interface
        const typedData = rawData as ActionItem[];
        
        // Filter items based on user role
        let filteredItems = typedData || [];
        if (userRole && userRole !== 'coach') {
          // Non-coach users only see items for their role or null role
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
    };
    
    fetchActionItems();
  }, [projectId, profile]);
  
  const markActionItemComplete = async (itemId: string) => {
    try {
      // Use REST API directly to avoid TypeScript issues
      const response = await fetch(
        `https://gluggyghzalabvlvwqqk.supabase.co/rest/v1/project_action_items?id=eq.${itemId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWdneWdoemFsYWJ2bHZ3cXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjIwNzQsImV4cCI6MjA1OTEzODA3NH0._EgQrKqGcedVgtHlDr3kCR7x6yzD8eaQ0ZvuQ0c7m08',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWdneWdoemFsYWJ2bHZ3cXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjIwNzQsImV4cCI6MjA1OTEzODA3NH0._EgQrKqGcedVgtHlDr3kCR7x6yzD8eaQ0ZvuQ0c7m08`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            completed: true,
            completion_date: new Date().toISOString()
          })
        }
      );
      
      if (!response.ok) throw new Error('Failed to update action item');
        
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
