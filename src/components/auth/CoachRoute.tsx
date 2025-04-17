
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CoachRouteProps {
  children: React.ReactNode;
}

const CoachRoute = ({ children }: CoachRouteProps) => {
  const { user, profile, isLoading, refreshProfile } = useAuth();
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
        
        // Method 2: Try checking user metadata from auth (if available)
        if (user.user_metadata && user.user_metadata.role === 'coach') {
          console.log("User is a coach according to auth metadata");
          setIsCoach(true);
          setChecking(false);
          return;
        }

        // Method 3: Direct method without using the profiles table query
        // This avoids the infinite recursion in the RLS policy
        console.log("Using direct role check from user_metadata");
        
        // Get the session to check user metadata directly
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData && sessionData.session) {
          const userMetadata = sessionData.session.user.user_metadata;
          console.log("User metadata from session:", userMetadata);
          
          if (userMetadata && userMetadata.role === 'coach') {
            console.log("User is a coach according to session metadata");
            setIsCoach(true);
            setChecking(false);
            return;
          }
        }

        console.log("Unable to verify coach role directly, using default check");
        // If we've reached here and still haven't confirmed coach status,
        // attempt to update the profile via the context
        refreshProfile();
        
        // Default to the current profile's role or false
        setIsCoach(profile?.role === 'coach' || false);
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
  }, [user, isLoading, profile, refreshProfile]);

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
