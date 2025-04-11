
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { useProjectData } from "@/hooks/useProjectData";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import MaterialsSpecialtiesSidebar from "@/components/project/materials/MaterialsSpecialtiesSidebar";
import MaterialsStatusTabs from "@/components/project/materials/MaterialsStatusTabs";
import MaterialsList from "@/components/project/materials/MaterialsList";

const ProjectMaterials = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projectData, isLoading } = useProjectData(projectId);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"scheduled" | "delivered" | "wishlist">("scheduled");
  const [activeSpecialty, setActiveSpecialty] = useState<string>("Tile");
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project materials...</div>
        </div>
      </div>
    );
  }

  const projectTitle = projectData?.title || "Unknown Project";

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId || ""} 
            projectTitle={projectTitle} 
            activePage="material" 
          />
          
          <div className="flex flex-1 overflow-hidden">
            {/* Specialties Sidebar */}
            <MaterialsSpecialtiesSidebar 
              activeSpecialty={activeSpecialty} 
              setActiveSpecialty={setActiveSpecialty} 
            />
            
            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-white">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Materials</h1>
                
                {/* Status Tabs */}
                <MaterialsStatusTabs 
                  activeStatus={activeStatus} 
                  onStatusChange={setActiveStatus} 
                />
                
                {/* Category Title */}
                <h2 className="text-xl font-semibold mt-6 mb-4">
                  {activeSpecialty} {activeStatus === "scheduled" ? "Scheduled" : activeStatus === "delivered" ? "Delivered" : "Wishlist"}
                </h2>
                
                {/* Search and Filter */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300"
                    />
                  </div>
                  
                  <Button variant="outline" size="icon" className="h-10 w-10 border-gray-300">
                    <Filter className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-full sm:w-auto sm:ml-auto">
                    <select className="h-10 rounded-md border border-gray-300 px-3 py-2 w-full sm:w-48">
                      <option value="recommended">Recommended</option>
                      <option value="date-asc">Date (earliest first)</option>
                      <option value="date-desc">Date (latest first)</option>
                      <option value="price-asc">Price (low to high)</option>
                      <option value="price-desc">Price (high to low)</option>
                    </select>
                  </div>
                </div>
                
                {/* Materials List */}
                <MaterialsList
                  activeSpecialty={activeSpecialty}
                  activeStatus={activeStatus}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectMaterials;
