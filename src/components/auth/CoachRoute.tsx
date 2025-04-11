
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
        return;
      }

      try {
        // Instead of relying on profile.role which might be causing issues,
        // directly query the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching coach status:", error);
          setIsCoach(false);
        } else {
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
  }, [user, isLoading]);

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
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and a coach, render the children
  return <>{children}</>;
};

export default CoachRoute;
