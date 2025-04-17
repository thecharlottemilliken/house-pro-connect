
import { useLocation, useParams } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import PropertyCard from "@/components/project/PropertyCard";
import TasksCard from "@/components/project/TasksCard";
import MessagesCard from "@/components/project/MessagesCard";
import EventsCard from "@/components/project/EventsCard";
import { SidebarProvider } from "@/components/ui/sidebar";

const ProjectDashboard = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  
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
  const projectTitle = projectData?.title || "Project Overview";
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
          
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-white overflow-y-auto">
            <div className="mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
                Project Overview
              </h1>
            </div>
            
            <div className="mb-3 sm:mb-4 md:mb-8">
              <div className="text-gray-600 text-sm sm:text-base md:text-lg">
                {propertyDetails.property_name} #{projectId.slice(-6)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              <PropertyCard 
                propertyDetails={propertyDetails} 
                renovationAreas={renovationAreas}
              />
              
              <TasksCard />
              
              <MessagesCard />
              
              <EventsCard />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDashboard;
