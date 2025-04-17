import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

export function useProfileRole() {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [roleData, setRoleData] = useState<string | null>(null);
  
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;

      // If profile already has role information, use that
      if (profile?.role) {
        setRoleData(profile.role);
        return;
      }

      // Otherwise, fetch from the database
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data?.role) {
          setRoleData(data.role);
          // Update the profile context as well
          refreshProfile();
        } else {
          console.warn("No role found or error:", error);
        }
      } catch (err) {
        console.error("Error checking role:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [user, profile?.role, refreshProfile]);
  
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
