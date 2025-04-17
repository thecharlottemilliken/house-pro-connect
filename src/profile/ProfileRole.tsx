
import { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

export function useProfileRole() {
  const { user, profile, refreshProfile } = useAuth();
  
  useEffect(() => {
    const checkRoleDirectly = async () => {
      if (!user || (profile && profile.role)) return;
      
      try {
        // This is a simplified query that's less likely to hit RLS recursion issues
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!error && data && !profile?.role) {
          console.log("Retrieved role directly:", data.role);
          refreshProfile();
        }
      } catch (error) {
        console.error("Error in direct role check:", error);
      }
    };
    
    checkRoleDirectly();
  }, [user, profile, refreshProfile]);
  
  return { role: profile?.role || "Not assigned" };
}
