
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useActionItemsGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateActionItems = async (projectId: string): Promise<boolean> => {
    if (!projectId) {
      console.error("Cannot generate action items: No project ID provided");
      return false;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the edge function to generate action items
      const { data, error } = await supabase.functions.invoke('generate-action-items', {
        body: { projectId }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        setError(error);
        toast.error("Failed to generate action items");
        return false;
      }
      
      console.log("Action items generated:", data);
      return true;
    } catch (err: any) {
      console.error("Error generating action items:", err);
      setError(err);
      toast.error("Error while generating action items");
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
