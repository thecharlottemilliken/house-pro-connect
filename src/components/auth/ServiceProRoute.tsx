
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ServiceProNavbar from "@/components/service-pro/ServiceProNavbar";

interface ServiceProRouteProps {
  children: React.ReactNode;
}

const ServiceProRoute = ({ children }: ServiceProRouteProps) => {
  const { user, profile, isLoading } = useAuth();

  // While checking authentication status, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If authenticated but not a service pro, redirect to main dashboard
  // Check for both 'service-pro' and 'service_pro' variations
  if (profile?.role !== 'service_pro' && profile?.role !== 'service-pro') {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and a service pro, render the ServiceProNavbar and children
  return (
    <>
      <ServiceProNavbar />
      {children}
    </>
  );
};

export default ServiceProRoute;
