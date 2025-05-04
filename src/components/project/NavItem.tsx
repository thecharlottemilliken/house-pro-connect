
import React from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  Pencil, 
  Users, 
  MessageSquare, 
  FileText, 
  File, 
  Scissors, 
  CreditCard, 
  History,
  LayoutDashboard,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  to?: string;
  onClick?: () => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'home':
      return <Home className="h-5 w-5" />;
    case 'design':
      return <Pencil className="h-5 w-5" />;
    case 'team':
      return <Users className="h-5 w-5" />;
    case 'message':
      return <MessageSquare className="h-5 w-5" />;
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'file':
      return <File className="h-5 w-5" />;
    case 'material':
      return <Scissors className="h-5 w-5" />;
    case 'accounting':
      return <CreditCard className="h-5 w-5" />;
    case 'activity':
      return <History className="h-5 w-5" />;
    case 'overview':
      return <LayoutDashboard className="h-5 w-5" />;
    case 'manage':
      return <Settings className="h-5 w-5" />;
    default:
      return <Home className="h-5 w-5" />;
  }
};

const NavItem = ({ icon, label, active, to, onClick }: NavItemProps) => {
  const content = (
    <>
      <span className="mr-3 flex-shrink-0">{getIcon(icon)}</span>
      <span className="truncate">{label}</span>
    </>
  );

  const buttonClass = cn(
    "w-full flex items-center p-4 rounded-md text-[#0f3a4d]", 
    active 
      ? 'bg-[#cad9df] font-medium' 
      : 'hover:bg-[#cad9df] transition-colors',
    "text-sm md:text-base"
  );

  if (to) {
    return (
      <li>
        <Link to={to} className={buttonClass} onClick={onClick}>
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        className={buttonClass}
        onClick={onClick}
      >
        {content}
      </button>
    </li>
  );
};

// Expose the getIcon function for use in other components
NavItem.getIcon = getIcon;

export default NavItem;
