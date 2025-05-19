
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ServiceProNavbar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const navLinks = [
    { name: "DASHBOARD", href: "/service-pro-dashboard" },
    { name: "PROJECTS", href: "/projects" },
    { name: "REAL ESTATE", href: "/real-estate" },
    { name: "YOUR PROJECTS", href: "/your-projects" },
    { name: "YOUR PROPERTIES", href: "/your-properties" },
    { name: "MESSAGES", href: "/service-pro-messages" },
    { name: "ACCOUNTING", href: "/accounting" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-orange-600 text-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/service-pro-dashboard" className="flex">
              <span className="text-xl font-bold bg-gray-800 px-4 py-2 rounded">Rehab Squared</span>
            </Link>
          </div>
          
          {/* Navigation links - desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium text-white hover:text-gray-200 ${
                  isActive(link.href) ? "border-b-2 border-white pb-1" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* User profile and settings */}
          <div className="flex items-center">
            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end">
                <DropdownMenuItem asChild>
                  <Link to="/service-pro-profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-white">
              <Settings className="h-5 w-5" />
            </Button>
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 pt-2 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium text-white hover:text-gray-200 px-3 py-2 ${
                    isActive(link.href) ? "bg-orange-700" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Add profile and logout options to mobile menu */}
              <div className="border-t border-white/20 mt-2 pt-2">
                <Link
                  to="/service-pro-profile"
                  className="flex items-center text-sm font-medium text-white hover:text-gray-200 px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" /> Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center text-sm font-medium text-white hover:text-gray-200 px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center w-full text-left text-sm font-medium text-white hover:text-gray-200 px-3 py-2"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default ServiceProNavbar;
