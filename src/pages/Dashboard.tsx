
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ResidentDashboard from "@/components/dashboard/ResidentDashboard";
import ServiceProDashboard from "@/components/dashboard/ServiceProDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout title="Dashboard">
      {user?.role === "resident" ? <ResidentDashboard /> : <ServiceProDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;
