
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Filter, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectData } from "@/hooks/useProjectData";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import DocumentList from "@/components/project/documents/DocumentList";
import TagFilter from "@/components/project/documents/TagFilter";
import SortDropdown from "@/components/project/documents/SortDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

const ProjectDocuments = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projectData, propertyDetails, isLoading } = useProjectData(projectId);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>("Insurance");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project documents...</div>
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
            activePage="file" 
          />
          
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6 md:mb-8 flex-wrap gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Documents</h1>
                <Button className="flex items-center gap-2 bg-[#0f566c] hover:bg-[#0a3d4d] w-full sm:w-auto">
                  <Upload className="h-4 w-4" /> 
                  UPLOAD DOCUMENT
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 border-gray-300"
                  />
                </div>
                
                <div className="w-full sm:w-auto">
                  <TagFilter selectedTag={selectedTag} onSelectTag={setSelectedTag} />
                </div>
                
                <Button variant="outline" size="icon" className="h-10 w-10 border-gray-300">
                  <Filter className="h-4 w-4" />
                </Button>
                
                <div className="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0">
                  <SortDropdown />
                </div>
              </div>

              <DocumentList searchQuery={searchQuery} selectedTag={selectedTag} />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDocuments;
