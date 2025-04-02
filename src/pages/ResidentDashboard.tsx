
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import RecommendedContent from "@/components/dashboard/RecommendedContent";

const ResidentDashboard = () => {
  const navigate = useNavigate();
  // In a real app, this would come from authentication or context
  const username = "Jarett";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <main className="flex-1 px-12 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome,</h1>
          <p className="text-3xl text-gray-800">{username}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-8 mb-12">
          <div className="flex justify-between items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Live in Your Dream Home?</h2>
              <p className="text-gray-700 mb-2">
                Revamp your home with a personalized renovation project—bring your vision to life with expert designers and contractors.
              </p>
              <p className="text-gray-700">
                Start today and create the space you've always dreamed of!
              </p>
            </div>
            <Button 
              onClick={() => navigate("/create-project")} 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
            >
              <Plus className="mr-2 h-5 w-5" /> CREATE NEW PROJECT
            </Button>
          </div>
        </div>
        
        <RecommendedContent />
      </main>
    </div>
  );
};

export default ResidentDashboard;
