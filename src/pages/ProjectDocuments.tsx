
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import DocumentList from "@/components/project/documents/DocumentList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SortDropdown from "@/components/project/documents/SortDropdown";
import TagFilter from "@/components/project/documents/TagFilter";

const ProjectDocuments = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const { projectData, isLoading } = useProjectData(
    params.projectId,
    location.state
  );
  
  const projectId = projectData?.id || params.projectId || "";
  const projectTitle = projectData?.title || "Unknown Project";
  
  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="documents"
          />
          
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <h1 className="text-2xl font-bold">Documents</h1>
                <Button className="bg-[#0f566c] hover:bg-[#0d4a5d] w-full sm:w-auto">
                  Upload Document
                </Button>
              </div>
              
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                <div className="relative w-full sm:w-[280px] md:w-[320px]">
                  <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search documents"
                    className="pl-10 border-gray-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4">
                  <TagFilter 
                    selectedTag={selectedTag} 
                    onSelectTag={setSelectedTag}
                  />
                  <SortDropdown variant="documents" />
                </div>
              </div>
            </div>
            
            <DocumentList 
              searchQuery={searchQuery}
              selectedTag={selectedTag}
            />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectDocuments;
