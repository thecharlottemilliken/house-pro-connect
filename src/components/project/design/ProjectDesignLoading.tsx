
import React from 'react';
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

const ProjectDesignLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      <div className="flex-1 p-4 md:p-10">
        <div className="text-center py-10">Loading project details...</div>
      </div>
    </div>
  );
};

export default ProjectDesignLoading;
