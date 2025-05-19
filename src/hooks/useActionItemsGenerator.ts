import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useActionItemsGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasErrored, setHasErrored] = useState(false); // Track if we've already shown an error
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts

  const generateActionItems = async (projectId: string): Promise<boolean> => {
    if (!projectId) {
      console.error("Cannot generate action items: No project ID provided");
      return false;
    }
    
    // If we've already tried 3 times, don't keep retrying
    if (retryCount > 2) {
      console.log("Maximum retry attempts reached for action item generation");
      return false;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`Calling generate-action-items function for project ${projectId}`);
      
      // Call the edge function to generate action items
      const { data, error } = await supabase.functions.invoke('generate-action-items', {
        body: { projectId }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        setError(error);
        setRetryCount(prevCount => prevCount + 1);
        
        // Only show the toast once per session
        if (!hasErrored) {
          toast.error("Failed to generate action items");
          setHasErrored(true);
        }
        return false;
      }
      
      // Reset the error state if successful
      setHasErrored(false);
      setRetryCount(0);
      console.log("Action items generated:", data);
      return true;
    } catch (err: any) {
      console.error("Error generating action items:", err);
      setError(err);
      setRetryCount(prevCount => prevCount + 1);
      
      // Only show the toast once per session
      if (!hasErrored) {
        toast.error("Error while generating action items");
        setHasErrored(true);
      }
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const resetErrorState = () => {
    setHasErrored(false);
    setRetryCount(0);
  };
  
  return {
    generateActionItems,
    isGenerating,
    error,
    hasErrored,
    resetErrorState
  };
};
