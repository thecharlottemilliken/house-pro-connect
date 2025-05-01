
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const ManagementPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  
  // Management preferences state
  const [managementLevel, setManagementLevel] = useState<string>("full-service");
  const [specialRequirements, setSpecialRequirements] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [wantProjectCoach, setWantProjectCoach] = useState<boolean>(true);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
      }
      setProjectPrefs(location.state);
      
      // Load existing management preferences if available
      if (location.state.managementPreferences) {
        const prefs = location.state.managementPreferences;
        if (prefs.managementLevel) setManagementLevel(prefs.managementLevel);
        if (prefs.specialRequirements) setSpecialRequirements(prefs.specialRequirements);
        if (prefs.wantProjectCoach !== undefined) setWantProjectCoach(prefs.wantProjectCoach);
        if (prefs.phoneNumber) setPhoneNumber(prefs.phoneNumber);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);

  const savePreferences = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save preferences",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Create management preferences object with all collected data
    const managementPreferences = {
      managementLevel,
      specialRequirements,
      wantProjectCoach,
      phoneNumber
    };
    
    try {
      const updatedProjectPrefs = {
        ...projectPrefs,
        propertyId,
        projectId,
        managementPreferences,
        title: projectPrefs?.title || "New Project"
      };
      
      setProjectPrefs(updatedProjectPrefs);
      
      navigate("/prior-experience", {
        state: updatedProjectPrefs
      });
    } catch (error: any) {
      console.error('Error saving management preferences:', error);
      toast({
        title: "Error",
        description: `Failed to save management preferences: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextStep = async () => {
    await savePreferences();
  };
  
  const goBack = () => {
    navigate("/design-preferences", {
      state: projectPrefs
    });
  };

  const steps = [
    { number: 1, title: "Select a Property", current: false },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: true },
    { number: 7, title: "Prior Experience", current: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Management Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            Let us know how you would like your renovation project to be managed.
          </p>
          
          <div className="space-y-8 mb-10">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">How would you like your project to be managed?</h3>
              
              <RadioGroup 
                value={managementLevel} 
                onValueChange={setManagementLevel}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="full-service" id="full-service" className="mt-1" />
                  <div>
                    <Label htmlFor="full-service" className="font-medium">Full-Service Management</Label>
                    <p className="text-sm text-gray-600">We handle everything from start to finish, including contractor coordination, timeline management, and quality control.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="partial" id="partial" className="mt-1" />
                  <div>
                    <Label htmlFor="partial" className="font-medium">Partial Management</Label>
                    <p className="text-sm text-gray-600">We help with key aspects like contractor selection and quality checks, but you stay involved in day-to-day decisions.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="consulting" id="consulting" className="mt-1" />
                  <div>
                    <Label htmlFor="consulting" className="font-medium">Consulting Only</Label>
                    <p className="text-sm text-gray-600">You manage the project, and we provide guidance and advice as needed.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="self-managed" id="self-managed" className="mt-1" />
                  <div>
                    <Label htmlFor="self-managed" className="font-medium">Self-Managed</Label>
                    <p className="text-sm text-gray-600">You prefer to handle everything yourself with minimal assistance.</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Would you like a project coach?</h3>
              <RadioGroup 
                value={wantProjectCoach ? "yes" : "no"} 
                onValueChange={(value) => setWantProjectCoach(value === "yes")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="coach-yes" />
                  <Label htmlFor="coach-yes">Yes, I would like a project coach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="coach-no" />
                  <Label htmlFor="coach-no">No, I don't need a project coach</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Contact Phone Number (Optional)
              </Label>
              <input
                id="phoneNumber"
                type="tel"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700">
                Do you have any special requirements or concerns about project management?
              </Label>
              <Textarea 
                id="specialRequirements"
                placeholder="Tell us about any specific management needs, concerns, or expectations you have for your renovation project..."
                className="min-h-[150px]"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-gray-200 gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              className="flex items-center text-[#174c65] order-2 sm:order-1 w-full sm:w-auto"
              onClick={goBack}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="text-[#174c65] border-[#174c65] w-full sm:w-auto"
                onClick={() => navigate("/dashboard")}
                disabled={isLoading}
              >
                SAVE & EXIT
              </Button>
              <Button
                className="flex items-center bg-[#174c65] hover:bg-[#174c65]/90 text-white w-full sm:w-auto justify-center"
                onClick={goToNextStep}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "NEXT"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPreferences;
