
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteAccount = async (password: string) => {
    try {
      setIsDeleting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to delete your account",
          variant: "destructive",
        });
        setIsDeleting(false);
        return { success: false };
      }
      
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { userId: user.id, password },
      });
      
      if (error) {
        console.error("Error deleting account:", error);
        toast({
          title: "Account deletion failed",
          description: error.message || "An error occurred while deleting your account",
          variant: "destructive",
        });
        setIsDeleting(false);
        return { success: false };
      }
      
      if (data?.error) {
        toast({
          title: "Account deletion failed",
          description: data.error,
          variant: "destructive",
        });
        setIsDeleting(false);
        return { success: false };
      }
      
      // Sign out after successful deletion
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been deleted",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Error in deleteAccount:", error);
      toast({
        title: "Account deletion failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsDeleting(false);
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAccount,
    isDeleting,
  };
};
