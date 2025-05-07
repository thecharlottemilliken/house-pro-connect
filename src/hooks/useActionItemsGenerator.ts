
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useActionItemsGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateActionItems = async (projectId: string): Promise<boolean> => {
    if (!projectId) return false;
    
    setIsGenerating(true);
    
    try {
      // Call our edge function to generate action items
      const { data, error } = await supabase.functions.invoke(
        'generate-action-items',
        {
          body: { projectId }
        }
      );
      
      if (error) throw error;
      
      // Show success message with count of generated items
      if (data?.items?.length > 0) {
        toast.success(`Generated ${data.items.length} action items`);
      } else {
        toast.info("No new action items needed");
      }
      
      return true;
    } catch (error) {
      console.error("Error generating action items:", error);
      toast.error("Failed to generate action items");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    generateActionItems,
    isGenerating
  };
};
