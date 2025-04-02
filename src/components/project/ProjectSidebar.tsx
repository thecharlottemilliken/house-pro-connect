
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavItem from "./NavItem";

interface ProjectSidebarProps {
  projectId: string;
  projectTitle?: string;
}

const ProjectSidebar = ({ projectId, projectTitle = "Kitchen Project" }: ProjectSidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="w-64 bg-[#e6eef1] border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-700 mb-4 pl-0 hover:bg-transparent hover:text-[#1e5c78]"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> All Projects
        </Button>
        
        <div className="flex items-center gap-2 text-[#1e5c78] font-medium mb-3 pl-1">
          <span className="w-5 h-5 text-xs flex items-center justify-center border border-[#1e5c78] rounded-full">✓</span>
          {projectTitle}
        </div>
      </div>
      
      <nav className="p-3">
        <ul className="space-y-1">
          <NavItem icon="home" label="Manage" active={true} />
          <NavItem icon="design" label="Design" active={false} />
          <NavItem icon="team" label="Team" active={false} />
          <NavItem icon="message" label="Messages" active={false} />
          <NavItem icon="document" label="Bids & Proposals" active={false} />
          <NavItem icon="file" label="Documents" active={false} />
          <NavItem icon="material" label="Materials" active={false} />
          <NavItem icon="accounting" label="Accounting" active={false} />
          <NavItem icon="activity" label="Activity History" active={false} />
        </ul>
      </nav>
    </div>
  );
};

export default ProjectSidebar;
