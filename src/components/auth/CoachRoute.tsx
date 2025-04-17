import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jwtDecode from "jwt-decode";

interface CoachRouteProps {
  children: React.ReactNode;
}

const CoachRoute = ({ children }: CoachRouteProps) => {
  const { user, profile, isLoading, refreshProfile, session } = useAuth();
  const [isCoach, setIsCoach] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkCoachRole = async () => {
      if (!user) {
        setChecking(false);
        setIsCoach(false);
        return;
      }

      try {
        console.log("Checking coach role for user:", user.id);
        console.log("Current profile from context:", profile);
        
        // Method 1: Try using the profile from context first
        if (profile && profile.role === 'coach') {
          console.log("User is a coach according to profile context");
          setIsCoach(true);
          setChecking(false);
          return;
        }
        
        // Optional: Decode JWT to check for custom claims if needed
        if (session?.access_token) {
          try {
            const decodedToken = jwtDecode(session.access_token);
            console.log("Decoded token:", decodedToken);
            
            // Check for coach role in JWT claims
            // @ts-ignore - allow flexible token type
            if (decodedToken.app_role === 'coach') {
              console.log("User is a coach according to JWT token");
              setIsCoach(true);
              setChecking(false);
              return;
            }
          } catch (decodeError) {
            console.error("Error decoding JWT:", decodeError);
          }
        }
        
        // Method 2: Try checking user metadata from auth (if available)
        if (user.user_metadata && user.user_metadata.role === 'coach') {
          console.log("User is a coach according to auth metadata");
          setIsCoach(true);
          setChecking(false);
          return;
        }

        // Method 3: Check directly from database if needed
        console.log("Using direct database check for role");
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData && profileData.role === 'coach') {
          console.log("User is a coach according to direct database check");
          setIsCoach(true);
          setChecking(false);
          return;
        }

        // Default to false if we can't confirm coach status
        console.log("Unable to verify coach role, defaulting to false");
        setIsCoach(false);
      } catch (error) {
        console.error("Error in coach check:", error);
        setIsCoach(false);
      } finally {
        setChecking(false);
      }
    };

    if (!isLoading) {
      checkCoachRole();
    }
  }, [user, isLoading, profile, refreshProfile, session]);

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
    toast({
      title: "Access Denied",
      description: "You need coach permissions to access this area",
    });
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and a coach, render the children
  return <>{children}</>;
};

export default CoachRoute;
