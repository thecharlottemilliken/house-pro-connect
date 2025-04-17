
import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

export function useProfileRole() {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const checkRoleDirectly = async () => {
      if (!user || (profile && profile.role)) return;
      
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRoleDirectly();
  }, [user, profile, refreshProfile]);
  
  // Format the role for display (capitalize first letter)
  const formattedRole = profile?.role 
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "Not assigned";
    
  return { 
    role: profile?.role || null,
    displayRole: formattedRole,
    isLoading 
  };
}
