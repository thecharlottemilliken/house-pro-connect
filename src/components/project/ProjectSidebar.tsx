
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavItem from "./NavItem";
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const {
    open,
    toggleSidebar
  } = useSidebar();
  
  return <>
      <Sidebar variant="sidebar" className="border-r border-gray-200">
        <SidebarRail />
        <SidebarHeader>
          <div className="p-4 border-b border-gray-200">
            <Button variant="ghost" className="flex items-center text-gray-700 w-full pl-0 hover:bg-transparent hover:text-[#174c65]" onClick={() => navigate("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
            </Button>
            
            <Button variant="ghost" className="flex items-center text-gray-700 w-full pl-0 mt-2 hover:bg-transparent hover:text-[#174c65]" onClick={() => navigate("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> &lt;- All Projects
            </Button>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <nav className="p-3">
            <ul className="space-y-1">
              <NavItem icon="overview" label="Overview" active={activePage === "overview"} to={`/project-dashboard/${projectId}`} />
              <NavItem icon="manage" label="Management" active={activePage === "manage"} to={`/project-manage/${projectId}`} />
              <NavItem icon="design" label="Design" active={activePage === "design"} to={`/project-design/${projectId}`} />
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
      
      {/* Desktop sidebar toggle button with adjusted position */}
      <div className="hidden md:block fixed z-40 transition-all duration-300" style={{
        left: open ? 'calc(16.5rem - 12px)' : 'calc(3.5rem - 12px)',
        top: '20vh'
      }}>
        <Button variant="outline" size="icon" onClick={toggleSidebar} className="rounded-full shadow-md bg-white h-10 w-10">
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Mobile sidebar trigger - improved visibility and position */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <SidebarTrigger className="bg-[#0f566c] text-white h-14 w-14 rounded-full shadow-lg flex items-center justify-center" />
      </div>
    </>;
};

export default ProjectSidebar;
