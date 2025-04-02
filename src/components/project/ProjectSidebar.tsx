
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavItem from "./NavItem";

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
    <div className="w-64 bg-[#EFF3F7] border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <Button variant="ghost" className="flex items-center text-gray-700 mb-4 pl-0 hover:bg-transparent hover:text-[#174c65]" onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> All Projects
        </Button>
        
        <div className="flex items-center gap-2 text-[#174c65] font-medium mb-3 pl-1">
          <span className="w-5 h-5 text-xs flex items-center justify-center border border-[#174c65] rounded-full">✓</span>
          {projectTitle}
        </div>
      </div>
      
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
    </div>
  );
};

export default ProjectSidebar;
