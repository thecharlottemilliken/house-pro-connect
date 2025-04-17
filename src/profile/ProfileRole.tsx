
import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

export function useProfileRole() {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [roleData, setRoleData] = useState<string | null>(null);
  
  useEffect(() => {
    // First check if the role is already in the profile
    if (profile?.role) {
      setRoleData(profile.role);
      return;
    }
    
    const checkRoleDirectly = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Direct query to profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!error && data && data.role) {
          console.log("Retrieved role directly:", data.role);
          setRoleData(data.role);
          refreshProfile();
        } else if (error) {
          console.error("Error fetching role:", error);
        } else {
          console.log("No role found for user");
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
  const formattedRole = roleData 
    ? roleData.charAt(0).toUpperCase() + roleData.slice(1)
    : "Not assigned";
    
  return { 
    role: roleData || profile?.role || null,
    displayRole: formattedRole,
    isLoading 
  };
}
