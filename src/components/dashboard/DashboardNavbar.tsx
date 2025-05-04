import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Settings, User, X, BellDot } from "lucide-react";
import { useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationsPopover from '../notifications/NotificationsPopover';
const DashboardNavbar = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  const currentPath = window.location.pathname;
  const isProjectsActive = currentPath === '/projects' || currentPath.includes('/project-');
  const isCoach = profile?.role === 'coach';
  const isCoachDashboardActive = currentPath === '/coach-dashboard';
  return <nav className="bg-[#174c65] text-white py-3 px-4 md:py-4 md:px-12 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <span onClick={() => navigate('/dashboard')} className="self-center md:text-xl font-bold text-white bg-orange-500 px-3 py-2 md:px-5 md:py-3 cursor-pointer text-sm">
            Rehab Squared
          </span>
        </div>
        
        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-8">
          <NavItem label="DASHBOARD" path="/dashboard" isActive={currentPath === '/dashboard'} />
          {isCoach && <NavItem label="COACH DASHBOARD" path="/coach-dashboard" isActive={isCoachDashboardActive} />}
          <NavItem label="PROJECTS" path="/projects" isActive={isProjectsActive} />
          <NavItem label="JOBS" path="/jobs" isActive={currentPath === '/jobs'} />
          <NavItem label="REAL ESTATE" path="/real-estate" isActive={currentPath === '/real-estate'} />
          <NavItem label="YOUR PROPERTIES" path="/your-properties" isActive={currentPath === '/your-properties'} />
          <NavItem label="MESSAGES" path="/messages" isActive={currentPath === '/messages'} />
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" className="text-white hover:bg-[#174c65]/90" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Notification Bell with Popover */}
          <NotificationsPopover hasNotifications={hasNotifications} setHasNotifications={setHasNotifications} />
          
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-[#174c65]/90" onClick={() => navigate('/profile')}>
            <User className="h-6 w-6" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-white hover:bg-[#174c65]/90" onClick={() => navigate('/settings')}>
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && <div className="md:hidden mt-3 pb-2 border-t border-[#174c65]/30 pt-2">
          <div className="flex flex-col space-y-3">
            <MobileNavItem label="DASHBOARD" path="/dashboard" isActive={currentPath === '/dashboard'} onClick={() => setMobileMenuOpen(false)} />
            {isCoach && <MobileNavItem label="COACH DASHBOARD" path="/coach-dashboard" isActive={isCoachDashboardActive} onClick={() => setMobileMenuOpen(false)} />}
            <MobileNavItem label="PROJECTS" path="/projects" isActive={isProjectsActive} onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem label="JOBS" path="/jobs" isActive={currentPath === '/jobs'} onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem label="REAL ESTATE" path="/real-estate" isActive={currentPath === '/real-estate'} onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem label="YOUR PROPERTIES" path="/your-properties" isActive={currentPath === '/your-properties'} onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem label="MESSAGES" path="/messages" isActive={currentPath === '/messages'} onClick={() => setMobileMenuOpen(false)} />
            
            <div className="flex justify-between pt-2 border-t border-[#174c65]/30">
              {/* Mobile Notification */}
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#174c65]/90 relative" onClick={() => {
            navigate('/notifications');
            setMobileMenuOpen(false);
          }}>
                <BellDot className="h-4 w-4 mr-2" /> Notifications
                {hasNotifications && <span className="absolute top-2 left-6 block h-2 w-2 rounded-full bg-orange-500 ring-1 ring-[#174c65]"></span>}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#174c65]/90" onClick={() => {
            navigate('/profile');
            setMobileMenuOpen(false);
          }}>
                <User className="h-4 w-4 mr-2" /> Profile
              </Button>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-[#174c65]/90" onClick={() => {
            navigate('/settings');
            setMobileMenuOpen(false);
          }}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>
            </div>
          </div>
        </div>}
    </nav>;
};
interface NavItemProps {
  label: string;
  path: string;
  isActive: boolean;
}
const NavItem = ({
  label,
  path,
  isActive
}: NavItemProps) => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(path)} className={`text-sm font-medium pb-2 ${isActive ? 'border-b-2 border-orange-500 text-white' : 'text-white/90 hover:text-white'}`}>
      {label}
    </button>;
};
interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}
const MobileNavItem = ({
  label,
  path,
  isActive,
  onClick
}: MobileNavItemProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(path);
    onClick();
  };
  return <button onClick={handleClick} className={`text-sm font-medium py-2 text-left ${isActive ? 'text-orange-500' : 'text-white/90 hover:text-white'}`}>
      {label}
    </button>;
};
export default DashboardNavbar;