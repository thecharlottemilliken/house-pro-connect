
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, User } from "lucide-react";

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  return (
    <nav className="bg-[#174c65] text-white py-4 px-12 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <span className="self-center text-xl font-bold text-white bg-orange-500 px-5 py-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            Rehab Squared
          </span>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8">
          <NavItem label="DASHBOARD" path="/dashboard" isActive={window.location.pathname === '/dashboard'} />
          <NavItem label="PROJECTS" path="/projects" isActive={false} />
          <NavItem label="REAL ESTATE" path="/real-estate" isActive={false} />
          <NavItem label="YOUR PROJECTS" path="/your-projects" isActive={false} />
          <NavItem label="YOUR PROPERTIES" path="/your-properties" isActive={false} />
          <NavItem label="MESSAGES" path="/messages" isActive={false} />
        </div>
        
        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full text-white hover:bg-[#174c65]/90"
            onClick={() => navigate('/profile')}
          >
            <User className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-[#174c65]/90"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  label: string;
  path: string;
  isActive: boolean;
}

const NavItem = ({ label, path, isActive }: NavItemProps) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(path)}
      className={`text-sm font-medium pb-2 ${
        isActive 
          ? 'border-b-2 border-orange-500 text-white' 
          : 'text-white/90 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
};

export default DashboardNavbar;
