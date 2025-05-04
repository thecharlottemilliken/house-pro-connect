
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavItem from "./NavItem";
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    open,
    toggleSidebar
  } = useSidebar();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if the current route is a project-related route
  const isProjectsActive = location.pathname.includes('/project-');

  // Get the active menu item's label for mobile view
  const getActiveMenuLabel = () => {
    switch (activePage) {
      case "overview": return "Project Overview";
      case "manage": return "Management";
      case "design": return "Design";
      case "team": return "Team";
      case "message": return "Messages";
      case "document": return "Bids & Proposals";
      case "file": return "Documents";
      case "material": return "Materials";
      case "accounting": return "Accounting";
      case "activity": return "Activity History";
      default: return "Project Overview";
    }
  };
  
  // Navigation items array for easier management
  const navigationItems = [
    { icon: "overview", label: "Project Overview", active: activePage === "overview", to: `/project-dashboard/${projectId}` },
    { icon: "manage", label: "Management", active: activePage === "manage", to: `/project-manage/${projectId}` },
    { icon: "design", label: "Design", active: activePage === "design", to: `/project-design/${projectId}` },
    { icon: "team", label: "Team", active: activePage === "team", to: `/project-team/${projectId}` },
    { icon: "message", label: "Messages", active: activePage === "message", to: `/project-messages/${projectId}` },
    { icon: "document", label: "Bids & Proposals", active: activePage === "document", to: `/project-bids-proposals/${projectId}` },
    { icon: "file", label: "Documents", active: activePage === "file", to: `/project-documents/${projectId}` },
    { icon: "material", label: "Materials", active: activePage === "material", to: `/project-materials/${projectId}` },
    { icon: "accounting", label: "Accounting", active: activePage === "accounting", to: `/project-accounting/${projectId}` },
    { icon: "activity", label: "Activity History", active: activePage === "activity", to: `/project-activity-history/${projectId}` },
  ];
  
  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar variant="sidebar" className="border-r border-gray-200 hidden md:block h-[calc(100vh-64px)] top-16">
        <SidebarRail />
        <SidebarHeader>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Button 
              variant="ghost" 
              className={`flex items-center text-gray-700 pl-0 hover:bg-transparent hover:text-[#174c65] ${isProjectsActive ? 'text-[#174c65] font-medium' : ''}`} 
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
            
            {open && (
              <Button
                variant="ghost"
                size="icon"
                className="flex"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4 text-gray-700" />
              </Button>
            )}
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <nav className="p-3">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <NavItem 
                  key={item.icon}
                  icon={item.icon} 
                  label={item.label} 
                  active={item.active} 
                  to={item.to} 
                />
              ))}
            </ul>
          </nav>
        </SidebarContent>
      </Sidebar>
      
      {/* Expand button that appears when sidebar is collapsed */}
      {!open && !isMobile && (
        <div className="fixed left-0 top-24 z-50">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-l-none shadow-md bg-white border border-l-0 border-gray-200"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4 text-gray-700" />
          </Button>
        </div>
      )}
      
      {/* Mobile Navigation Dropdown */}
      <div className="md:hidden fixed top-[64px] left-0 right-0 z-40 bg-[#f8fafc] border-b border-gray-200">
        <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center justify-between w-full p-4 text-sm font-medium text-[#0f3a4d] hover:bg-[#cad9df] transition-colors rounded-none"
            >
              <div className="flex items-center">
                {NavItem.getIcon(activePage || "overview")}
                <span className="ml-3">{getActiveMenuLabel()}</span>
              </div>
              {mobileMenuOpen ? 
                <ChevronUp className="h-5 w-5 text-[#0f3a4d]" /> : 
                <ChevronDown className="h-5 w-5 text-[#0f3a4d]" />
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-full rounded-t-none bg-[#f8fafc] border-gray-200 p-0 max-h-[70vh] overflow-y-auto shadow-lg" 
            align="start"
            side="bottom"
            sideOffset={0}
          >
            <nav className="p-0">
              <ul className="space-y-0 divide-y divide-gray-100">
                {navigationItems.map((item) => (
                  <li key={item.icon} className={cn(
                    "w-full",
                    item.active && "bg-[#cad9df]"
                  )}>
                    <NavItem 
                      icon={item.icon} 
                      label={item.label} 
                      active={item.active} 
                      to={item.to} 
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  </li>
                ))}
                <li className="w-full bg-[#e9f1f5] px-1 py-2">
                  <Button 
                    variant="outline"
                    className="flex items-center justify-center w-full bg-white border-[#0f566c] text-[#0f566c] hover:bg-[#0f566c] hover:text-white transition-colors"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/projects");
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
                  </Button>
                </li>
              </ul>
            </nav>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default ProjectSidebar;
