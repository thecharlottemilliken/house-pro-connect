
import React from "react";
import { 
  Home, 
  Pencil, 
  Users, 
  MessageSquare, 
  FileText, 
  File, 
  Scissors, 
  CreditCard, 
  History 
} from "lucide-react";

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
}

const NavItem = ({ icon, label, active }: NavItemProps) => {
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
      default:
        return <Home className="h-5 w-5" />;
    }
  };

  return (
    <li>
      <button
        className={`w-full flex items-center p-4 text-[#0f3a4d] ${
          active 
            ? 'bg-[#cad9df]' 
            : 'hover:bg-[#cad9df] transition-colors'
        }`}
      >
        <span className="mr-3">{getIcon(icon)}</span>
        {label}
      </button>
    </li>
  );
};

export default NavItem;
