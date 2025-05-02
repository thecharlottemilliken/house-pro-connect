
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = async (password: string) => {
    try {
      setIsDeleting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to delete your account");
        setIsDeleting(false);
        return { success: false };
      }
      
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { userId: user.id, password },
      });
      
      if (error) {
        console.error("Error deleting account:", error);
        toast.error(error.message || "An error occurred while deleting your account");
        setIsDeleting(false);
        return { success: false };
      }
      
      if (data?.error) {
        toast.error(data.error);
        setIsDeleting(false);
        return { success: false };
      }
      
      // Sign out after successful deletion
      await supabase.auth.signOut();
      
      toast.success("Your account and all associated data have been deleted");
      
      return { success: true };
    } catch (error: any) {
      console.error("Error in deleteAccount:", error);
      toast.error(error.message || "An unexpected error occurred");
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
