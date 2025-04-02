
import { useLocation, useParams } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import PropertyCard from "@/components/project/PropertyCard";
import TasksCard from "@/components/project/TasksCard";
import MessagesCard from "@/components/project/MessagesCard";
import EventsCard from "@/components/project/EventsCard";

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
  const renovationAreas = projectData?.renovationAreas || projectData?.renovation_areas || [];

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        <ProjectSidebar projectId={projectId} projectTitle={projectData?.title || "Kitchen Remodel"} />
        
        <div className="flex-1 p-8 bg-[#f3f3f3] overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              {projectData?.title || "Kitchen Remodel"}
            </h1>
            <p className="text-gray-600 text-lg">
              Family Home #{projectId.slice(-6)}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <PropertyCard 
              propertyDetails={propertyDetails} 
              renovationAreas={renovationAreas} 
            />
            <TasksCard />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MessagesCard />
            <EventsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
