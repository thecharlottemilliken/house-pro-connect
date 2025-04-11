
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CoachRouteProps {
  children: React.ReactNode;
}

const CoachRoute = ({ children }: CoachRouteProps) => {
  const { user, profile, isLoading } = useAuth();
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
        
        // Method 2: If profile context doesn't confirm coach status, query directly
        console.log("Querying database directly for role");
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching coach status:", error);
          toast({
            title: "Error",
            description: "Could not verify coach permissions",
            variant: "destructive"
          });
          setIsCoach(false);
        } else {
          console.log("Role from database query:", data?.role);
          setIsCoach(data?.role === 'coach');
        }
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
  }, [user, isLoading, profile]);

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
