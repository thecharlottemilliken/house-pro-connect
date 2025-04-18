
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { profile } = useAuth();
  
  // Redirect to the appropriate dashboard based on user role
  if (profile?.role === "coach") {
    return <Navigate to="/coach-dashboard" replace />;
  } else if (profile?.role === "resident") {
    return <Navigate to="/resident-dashboard" replace />;
  } else if (profile?.role === "service_pro") {
    return <Navigate to="/service-pro-dashboard" replace />;
  }
  
  // Default dashboard or loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl">Loading dashboard...</h1>
    </div>
  );
};

export default Dashboard;
