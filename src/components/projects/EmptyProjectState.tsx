
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyProjectState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h2>
      <p className="text-gray-600 mb-4">
        You haven't created any projects yet. Start your first renovation project today!
      </p>
      <Button 
        className="bg-[#174c65] hover:bg-[#174c65]/90"
        onClick={() => navigate("/create-project")}
      >
        <Plus className="mr-2 h-4 w-4" /> Create Your First Project
      </Button>
    </div>
  );
};

export default EmptyProjectState;
