
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface CoachRouteProps {
  children: React.ReactNode;
}

const CoachRoute = ({ children }: CoachRouteProps) => {
  const { user, profile, isLoading, refreshProfile, session } = useAuth();
  const [isCoach, setIsCoach] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    const checkCoachRole = async () => {
      if (!user) {
        setChecking(false);
        setIsCoach(false);
        return;
      }

      try {
        console.log("Checking coach role for user:", user.id);
        
        // Method 1: Try using the profile from context first
        if (profile && profile.role === 'coach') {
          console.log("User is a coach according to profile context");
          setIsCoach(true);
          setChecking(false);
          return;
        }
        
        // Method 2: Try checking user metadata from auth (if available)
        if (user.user_metadata && user.user_metadata.role === 'coach') {
          console.log("User is a coach according to auth metadata");
          setIsCoach(true);
          setChecking(false);
          return;
        }
        
        // Method 3: Try to decode token to check for custom claims
        if (session?.access_token) {
          try {
            const decodedToken = jwtDecode(session.access_token);
            console.log("Decoded JWT token:", decodedToken);
            
            // Check for app_role in various locations in the token
            // @ts-ignore - allow flexible token type
            const appRole = decodedToken.app_role || 
              // @ts-ignore - allow flexible token type
              decodedToken.app_metadata?.app_role;
              
            if (appRole === 'coach') {
              console.log("User is a coach according to JWT claim");
              setIsCoach(true);
              setChecking(false);
              return;
            }
          } catch (decodeError) {
            console.error("Error decoding JWT:", decodeError);
          }
        }

        // Method 4: Check directly from database if needed
        console.log("Using direct database check for role");
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile from DB:", profileError);
        } else if (profileData && profileData.role === 'coach') {
          console.log("User is a coach according to direct database check");
          setIsCoach(true);
          setChecking(false);
          
          // Update profile context for future checks
          refreshProfile();
          return;
        }

        // Method 5: Call set-claims function to ensure claims are set properly
        try {
          console.log("Calling set-claims to ensure coach claims are set");
          const { data: claimResponse, error: claimError } = await supabase.functions.invoke('set-claims', {
            body: { user_id: user.id }
          });
          
          console.log("Set-claims response:", claimResponse);
          
          if (claimError) {
            console.error("Error calling set-claims:", claimError);
          } else if (claimResponse && claimResponse.role === 'coach') {
            console.log("Set-claims confirmed coach role");
            setIsCoach(true);
            setChecking(false);
            
            // Refresh the session to get updated JWT with claims
            try {
              await supabase.auth.refreshSession();
              console.log("Session refreshed after setting claims");
              refreshProfile();
            } catch (refreshError) {
              console.error("Error refreshing session:", refreshError);
            }
            return;
          }
        } catch (claimInvokeError) {
          console.error("Error invoking set-claims function:", claimInvokeError);
        }

        // If we've tried multiple times and still can't confirm, check if we need to retry
        if (retryAttempts < 2) {
          console.log(`Retry attempt ${retryAttempts + 1} for coach check`);
          setRetryAttempts(retryAttempts + 1);
          // Retry after a short delay
          setTimeout(() => {
            checkCoachRole();
          }, 1500);
          return;
        }

        // Default to false if we can't confirm coach status
        console.log("Unable to verify coach role, defaulting to false");
        setIsCoach(false);
        setChecking(false);
      } catch (error) {
        console.error("Error in coach check:", error);
        setIsCoach(false);
        setChecking(false);
      }
    };

    if (!isLoading) {
      checkCoachRole();
    }
  }, [user, isLoading, profile, refreshProfile, session, retryAttempts]);

  // While checking authentication status or coach role, show loading state
  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  // If not authenticated or not a coach, redirect to dashboard
  if (!isCoach) {
    toast.error("Access Denied - You need coach permissions to access this area");
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and a coach, render the children
  return <>{children}</>;
};

export default CoachRoute;
