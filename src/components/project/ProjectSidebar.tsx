
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavItem from "./NavItem";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarRail
} from "@/components/ui/sidebar";

interface ProjectSidebarProps {
  projectId: string;
  projectTitle?: string;
  activePage?: string;
}

const ProjectSidebar = ({
  projectId,
  projectTitle = "Kitchen Project",
  activePage = ""
}: ProjectSidebarProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Sidebar variant="sidebar" className="border-r border-gray-200">
        <SidebarRail />
        <SidebarHeader>
          <div className="p-4 border-b border-gray-200">
            <Button 
              variant="ghost" 
              className="flex items-center text-gray-700 mb-4 pl-0 hover:bg-transparent hover:text-[#174c65]" 
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> All Projects
            </Button>
            <h2 className="text-xl font-semibold text-gray-900 truncate">{projectTitle}</h2>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <nav className="p-3">
            <ul className="space-y-1">
              <NavItem 
                icon="overview" 
                label="Overview" 
                active={activePage === "overview"} 
                to={`/project-dashboard/${projectId}`} 
              />
              <NavItem 
                icon="manage" 
                label="Management" 
                active={activePage === "manage"} 
                to={`/project-manage/${projectId}`} 
              />
              <NavItem icon="design" label="Design" active={activePage === "design"} />
              <NavItem icon="team" label="Team" active={activePage === "team"} />
              <NavItem icon="message" label="Messages" active={activePage === "message"} />
              <NavItem icon="document" label="Bids & Proposals" active={activePage === "document"} />
              <NavItem icon="file" label="Documents" active={activePage === "file"} />
              <NavItem icon="material" label="Materials" active={activePage === "material"} />
              <NavItem icon="accounting" label="Accounting" active={activePage === "accounting"} />
              <NavItem icon="activity" label="Activity History" active={activePage === "activity"} />
            </ul>
          </nav>
        </SidebarContent>
      </Sidebar>
      
      {/* Mobile Sidebar Trigger - visible only on small screens */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <SidebarTrigger className="bg-[#0f566c] text-white h-12 w-12 rounded-full shadow-lg" />
      </div>
    </>
  );
};

export default ProjectSidebar;
