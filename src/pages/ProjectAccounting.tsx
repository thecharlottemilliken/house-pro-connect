
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import AccountingSpecialtiesSidebar from "@/components/project/accounting/AccountingSpecialtiesSidebar";
import AccountingTabs from "@/components/project/accounting/AccountingTabs";

const ProjectAccounting = () => {
  const params = useParams();
  const isMobile = useIsMobile();
  const [activeSpecialty, setActiveSpecialty] = useState("Tile");
  
  const { projectData, propertyDetails, isLoading } = useProjectData(
    params.projectId
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

  const projectId = projectData.id || params.projectId;

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId}
            activePage="accounting"
          />
          
          <div className="flex flex-1 overflow-hidden">
            <AccountingSpecialtiesSidebar 
              activeSpecialty={activeSpecialty}
              setActiveSpecialty={setActiveSpecialty}
            />
            
            <div className="flex-1 overflow-y-auto p-6">
              <h1 className="text-2xl font-bold mb-6">Accounting</h1>
              <AccountingTabs activeSpecialty={activeSpecialty} />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectAccounting;
