
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Rehab Squared</h1>
        <p className="text-xl text-gray-600 mb-8">
          Transform your home with personalized renovation projects. Connect with expert designers and contractors to bring your vision to life.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleCreateAccount}
            size="lg" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            Create Account
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full border-gray-300"
            onClick={() => navigate("/")}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
