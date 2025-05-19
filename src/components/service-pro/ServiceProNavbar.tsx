
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useIsMobile } from "@/hooks/use-mobile";

const ServiceProNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  const navItems = [
    { name: "Dashboard", href: "/service-pro-dashboard" },
    { name: "Profile", href: "/service-pro-profile" },
    { name: "Jobs", href: "/service-pro-jobs" },
    { name: "Messages", href: "/service-pro-messages" },
  ];

  return (
    <nav className="bg-orange-600 text-white shadow-md w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/service-pro-dashboard" className="flex items-center">
              <span className="font-bold text-xl">Pro Dashboard</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="ml-3 relative">
              <NotificationsPopover>
                <Button variant="ghost" size="sm" className="text-white hover:bg-orange-700">
                  <Bell className="h-5 w-5" />
                </Button>
              </NotificationsPopover>
            </div>
            
            <div className="ml-3 relative hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:bg-orange-700"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Sign Out
              </Button>
            </div>
            
            {/* Mobile menu button */}
            {isMobile && (
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="ml-2 text-white hover:bg-orange-700 inline-flex items-center justify-center p-2 rounded-md"
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMenuOpen ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-orange-600 text-white">
                  <div className="flex flex-col pt-4 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="hover:bg-orange-700 px-3 py-2 rounded-md text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="text-white hover:bg-orange-700 justify-start px-3 py-2"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ServiceProNavbar;
