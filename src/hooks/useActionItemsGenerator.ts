import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useActionItemsGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasErrored, setHasErrored] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const generateActionItems = useCallback(async (projectId: string): Promise<boolean> => {
    if (!projectId) {
      console.error("Cannot generate action items: No project ID provided");
      return false;
    }
    
    // If we've already tried MAX_RETRIES times, don't keep retrying
    if (retryCount >= MAX_RETRIES) {
      console.log(`Maximum retry attempts (${MAX_RETRIES}) reached for action item generation`);
      return false;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`Calling generate-action-items function for project ${projectId}`);
      
      // Get a fresh session to ensure we have the latest auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.error("No active session found");
        throw new Error("Authentication required");
      }
      
      // Call the edge function to generate action items with proper auth
      const { data, error: invokeError } = await supabase.functions.invoke('generate-action-items', {
        body: { projectId }
      });
      
      if (invokeError) {
        console.error("Edge function error:", invokeError);
        setError(invokeError);
        setRetryCount(prevCount => prevCount + 1);
        
        if (!hasErrored) {
          toast.error("Failed to generate action items. Please try again later.");
          setHasErrored(true);
        }
        return false;
      }
      
      // Reset error state on success
      setHasErrored(false);
      setRetryCount(0);
      console.log("Action items generated successfully:", data);
      return true;
    } catch (err: any) {
      console.error("Error generating action items:", err);
      setError(err);
      setRetryCount(prevCount => prevCount + 1);
      
      if (!hasErrored) {
        toast.error("Error while generating action items");
        setHasErrored(true);
      }
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [hasErrored, retryCount]);
  
  const resetErrorState = useCallback(() => {
    setHasErrored(false);
    setRetryCount(0);
    setError(null);
  }, []);
  
  return {
    generateActionItems,
    isGenerating,
    error,
    hasErrored,
    resetErrorState,
    retryCount
  };
};
