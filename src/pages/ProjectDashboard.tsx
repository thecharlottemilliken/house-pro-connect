
import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import PropertyCard from "@/components/project/PropertyCard";
import EventsCard from "@/components/project/EventsCard";
import TasksCard from "@/components/project/TasksCard";
import MessagesCard from "@/components/project/MessagesCard";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ProjectDashboard = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const isCoach = profile?.role === "coach";
  
  const { projectData, propertyDetails, isLoading } = useProjectData(
    params.projectId,
    location.state
  );
  
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
  
  const projectId = projectData?.id || params.projectId || "";
  const projectTitle = projectData?.title || "Project Dashboard";
  
  // Check if SOW exists in the design_preferences
  const designPreferences = projectData?.design_preferences || {};
  const hasSOW = Object.keys(designPreferences).length > 0;

  // Extract renovation areas from project data
  const renovationAreas = projectData?.renovation_areas || [];

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="overview"
          />
          
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <PropertyCard propertyDetails={propertyDetails} renovationAreas={renovationAreas} />
                
                {isCoach && (
                  <div className="bg-white p-4 md:p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium">Statement of Work</h2>
                      <Button asChild size="sm" variant="outline" className="gap-2">
                        <Link to={`/project-sow/${projectId}`}>
                          <FileText className="h-4 w-4" />
                          {hasSOW ? "Edit SOW" : "Create SOW"}
                        </Link>
                      </Button>
                    </div>
                    {hasSOW ? (
                      <p className="text-sm text-gray-600">
                        This project has a Statement of Work. Click Edit SOW to view and modify it.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No Statement of Work has been created for this project yet. Click Create SOW to get started.
                      </p>
                    )}
                  </div>
                )}
                
                {/* Updated to use projectId directly in the component */}
                <TasksCard projectId={projectId} />
                <EventsCard projectId={projectId} />
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <MessagesCard projectId={projectId} />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDashboard;
