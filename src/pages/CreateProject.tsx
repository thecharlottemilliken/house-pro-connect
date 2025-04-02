
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

const CreateProject = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <main className="flex-1 px-12 py-8">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
        </Button>
        
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Project</h1>
          <p className="text-gray-600 mb-8">
            This is a placeholder for the project creation form. In a real application, you would have a form here to collect project details.
          </p>
          
          <div className="flex justify-end">
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Save and Continue
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
