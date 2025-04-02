
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

  const projectId = projectData.id || `#${Math.floor(100000 + Math.random() * 900000)}`;
  const projectTitle = projectData?.title || "Kitchen Remodel";
  const renovationAreas = projectData?.renovationAreas || projectData?.renovation_areas || [];

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={true}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="overview"
          />
          
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Project Overview
              </h1>
            </div>
            
            <div className="mb-8">
              <div className="text-gray-600 text-lg">
                Family Home #{projectId.slice(-6)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mb-8">
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
