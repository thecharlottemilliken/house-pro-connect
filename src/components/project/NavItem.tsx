
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

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  to?: string;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, to, onClick }: NavItemProps) => {
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

  const content = (
    <>
      <span className="mr-3">{getIcon(icon)}</span>
      {label}
    </>
  );

  const buttonClass = `w-full flex items-center p-4 text-[#0f3a4d] ${
    active 
      ? 'bg-[#cad9df]' 
      : 'hover:bg-[#cad9df] transition-colors'
  }`;

  if (to) {
    return (
      <li>
        <Link to={to} className={buttonClass}>
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

export default NavItem;
