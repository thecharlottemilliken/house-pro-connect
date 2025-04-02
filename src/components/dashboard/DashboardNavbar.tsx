
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardNavbar = () => {
  return (
    <header className="bg-[#174c65] text-white py-4 px-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="bg-orange-500 text-white font-bold py-3 px-6 rounded">
            Rehab Squared
          </Link>
          
          <nav className="flex space-x-8">
            <Link to="/dashboard" className="py-2 border-b-2 border-transparent hover:border-orange-500 transition-colors">
              DASHBOARD
            </Link>
            <Link to="/projects" className="py-2 border-b-2 border-transparent hover:border-orange-500 transition-colors">
              PROJECTS
            </Link>
            <Link to="/real-estate" className="py-2 border-b-2 border-transparent hover:border-orange-500 transition-colors">
              REAL ESTATE
            </Link>
            <Link to="/your-projects" className="py-2 border-b-2 border-orange-500 transition-colors">
              YOUR PROJECTS
            </Link>
            <Link to="/your-properties" className="py-2 border-b-2 border-transparent hover:border-orange-500 transition-colors">
              YOUR PROPERTIES
            </Link>
            <Link to="/messages" className="py-2 border-b-2 border-transparent hover:border-orange-500 transition-colors">
              MESSAGES
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:bg-[#1a5978]">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="text-white hover:bg-[#1a5978]">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
