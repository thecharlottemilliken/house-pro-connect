
import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { jwtDecode } from "jwt-decode";

export function useProfileRole() {
  const { user, profile, refreshProfile, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [roleData, setRoleData] = useState<string | null>(null);
  
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        // Method 1: Try using the profile from context first
        if (profile?.role) {
          console.log("Using role from profile context:", profile.role);
          setRoleData(profile.role);
          setIsLoading(false);
          return;
        }
        
        // Method 2: Try checking user metadata from auth
        if (user.user_metadata?.role) {
          console.log("Using role from user metadata:", user.user_metadata.role);
          setRoleData(user.user_metadata.role);
          refreshProfile(); // Update profile context for future checks
          setIsLoading(false);
          return;
        }
        
        // Method 3: Try to decode token to check for role claims
        if (session?.access_token) {
          try {
            const decodedToken = jwtDecode(session.access_token);
            // @ts-ignore - allow flexible token type
            const tokenRole = decodedToken.app_metadata?.app_role || null;
            
            if (tokenRole) {
              console.log("Using role from JWT token:", tokenRole);
              setRoleData(tokenRole);
              refreshProfile(); // Update profile context
              setIsLoading(false);
              return;
            }
          } catch (decodeError) {
            console.error("Error decoding JWT:", decodeError);
          }
        }

        // Method 4: Fetch from the database as last resort
        console.log("Fetching role from database");
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data?.role) {
          console.log("Role found in database:", data.role);
          setRoleData(data.role);
          refreshProfile(); // Update profile context
        } else {
          console.warn("No role found or error:", error);
          
          // Last attempt - call set-claims to ensure claims are set
          try {
            const { data: claimResponse } = await supabase.functions.invoke('set-claims', {
              body: { user_id: user.id }
            });
            
            if (claimResponse?.role) {
              console.log("Role determined from set-claims:", claimResponse.role);
              setRoleData(claimResponse.role);
              refreshProfile();
            }
          } catch (claimError) {
            console.error("Error calling set-claims:", claimError);
          }
        }
      } catch (err) {
        console.error("Error checking role:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [user, profile?.role, refreshProfile, session]);
  
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
