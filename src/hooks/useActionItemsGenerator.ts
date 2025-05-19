
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useActionItemsGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateActionItems = async (projectId: string): Promise<boolean> => {
    if (!projectId) return false;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the edge function to generate action items
      const { data, error } = await supabase.functions.invoke('generate-action-items', {
        body: { projectId }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        // Don't throw to prevent breaking UI flows
        setError(error);
        // Silently fail - this is a background process that shouldn't break the UI
        return false;
      }
      
      console.log("Action items generated:", data);
      return true;
    } catch (err: any) {
      console.error("Error generating action items:", err);
      setError(err);
      // Silently fail - this is a background process that shouldn't break the UI
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    generateActionItems,
    isGenerating,
    error
  };
};
