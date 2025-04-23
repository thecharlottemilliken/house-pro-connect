
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3 sm:gap-0">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Projects</h1>
      <Button 
        className="bg-[#174c65] hover:bg-[#174c65]/90 w-full sm:w-auto"
        onClick={() => navigate("/create-project")}
      >
        <Plus className="mr-2 h-4 w-4" /> CREATE NEW PROJECT
      </Button>
    </div>
  );
};

export default ProjectHeader;
