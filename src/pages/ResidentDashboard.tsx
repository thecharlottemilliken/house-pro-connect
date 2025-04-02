
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import { useAuth } from "@/contexts/AuthContext";

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Get the user's first name from their profile
  const firstName = profile?.name?.split(' ')[0] || "Guest";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <main className="flex-1 px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Welcome,</h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-800">{firstName}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Ready to Live in Your Dream Home?</h2>
              <p className="text-sm sm:text-base text-gray-700">
                Revamp your home with a personalized renovation project—bring your vision to life with expert designers and contractors.
              </p>
              <p className="text-sm sm:text-base text-gray-700 mt-2">
                Start today and create the space you've always dreamed of!
              </p>
            </div>
            <Button 
              onClick={() => navigate("/create-project")} 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white h-auto py-2 px-4 sm:py-3 sm:px-6 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> CREATE NEW PROJECT
            </Button>
          </div>
        </div>
        
        <RecommendedContent />
      </main>
    </div>
  );
};

export default ResidentDashboard;
