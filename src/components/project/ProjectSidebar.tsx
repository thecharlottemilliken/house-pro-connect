
import React from "react";
import {
  Home,
  Palette,
  FileText,
  MessageSquare,
  Users,
  ShoppingCart,
  Activity,
  Briefcase,
  ListChecks,
  LayoutDashboard
} from "lucide-react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface ProjectSidebarProps {
  projectId: string;
  projectTitle?: string;
  activePage: string;
}

// Add SOW item to navigation items
const navItems = [
  { key: "overview", label: "Overview", icon: Home, path: "project-dashboard" },
  { key: "design", label: "Design", icon: Palette, path: "project-design" },
  { key: "sow", label: "Statement of Work", icon: FileText, path: "project-sow" }, // Added SOW item
  { key: "documents", label: "Documents", icon: FileText, path: "project-documents" },
  { key: "messages", label: "Messages", icon: MessageSquare, path: "project-messages" },
  { key: "team", label: "Team", icon: Users, path: "project-team" },
  { key: "materials", label: "Materials", icon: ShoppingCart, path: "project-materials" },
  { key: "accounting", label: "Accounting", icon: Briefcase, path: "project-accounting" },
  { key: "manage", label: "Manage", icon: ListChecks, path: "project-manage" },
  { key: "activity", label: "Activity", icon: Activity, path: "project-activity" },
  { key: "bids-proposals", label: "Bids/Proposals", icon: LayoutDashboard, path: "project-bids-proposals" },
];

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ projectId, projectTitle = "Project", activePage }) => {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-secondary text-secondary-foreground w-60",
        open ? "block" : "hidden"
      )}
    >
      <div className="px-6 py-4">
        <h2 className="font-semibold text-sm uppercase">{projectTitle}</h2>
        <p className="text-muted-foreground text-xs">Project ID: {projectId.slice(-6)}</p>
      </div>
      <nav className="flex flex-col flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={`/${item.path}/${projectId}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default ProjectSidebar;
