
import React, { useState } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import SOWCreationWizard from "@/components/project/sow/SOWCreationWizard";
import { Card } from "@/components/ui/card";

const ProjectSOW = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  
  const projectId = params.projectId || "";
  const { hasAccess, isOwner, role, isLoading: isAccessLoading } = useProjectAccess(projectId);
  
  const { projectData, propertyDetails, isLoading: isProjectLoading } = useProjectData(
    projectId,
    location.state
  );

  const isLoading = isAccessLoading || isProjectLoading;
  const isCoach = profile?.role === 'coach';

  // If access check is complete and user doesn't have access, redirect to projects
  if (!isAccessLoading && !hasAccess) {
    return <Navigate to="/projects" replace />;
  }

  // Only coaches can create SOW
  if (!isAccessLoading && !isCoach) {
    return <Navigate to={`/project-dashboard/${projectId}`} replace />;
  }

  if (isLoading || !propertyDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  const projectTitle = projectData?.title || "Statement of Work";

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="sow"
          />
          
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 overflow-y-auto">
            <div className="mb-3 sm:mb-4 md:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Create Statement of Work
              </h1>
              <p className="text-gray-600 mt-2">
                Create a comprehensive SOW by defining work areas, labor requirements, 
                and materials needed for this project.
              </p>
            </div>
            
            <Card className="bg-white border-0 shadow-sm">
              <SOWCreationWizard 
                projectId={projectId} 
                projectData={projectData}
                propertyDetails={propertyDetails}
              />
            </Card>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectSOW;
