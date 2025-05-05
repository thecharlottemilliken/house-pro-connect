
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";
import { Textarea } from "@/components/ui/textarea";

const PriorExperience = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    propertyId, 
    renovationAreas, 
    projectPreferences,
    constructionPreferences,
    designPreferences,
    managementPreferences
  } = location.state || {};
  
  const [priorExperience, setPriorExperience] = useState({
    priorRenovationExperience: "",
    designVision: "",
    additionalNotes: ""
  });
  
  const steps = [
    { number: 1, title: "Select a Property", current: false },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: true },
    { number: 8, title: "Summary", current: false },
  ];
  
  const handleUpdateField = (field: keyof typeof priorExperience, value: string) => {
    setPriorExperience(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleBack = () => {
    navigate("/management-preferences", { 
      state: { 
        propertyId,
        renovationAreas,
        projectPreferences,
        constructionPreferences,
        designPreferences,
        managementPreferences
      } 
    });
  };
  
  const handleNext = () => {
    if (!propertyId) {
      toast({
        title: "Error",
        description: "Missing property information. Please start from the beginning.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the summary step instead of directly creating the project
    navigate("/project-summary", { 
      state: { 
        propertyId,
        renovationAreas,
        projectPreferences,
        constructionPreferences,
        designPreferences,
        managementPreferences,
        priorExperience
      } 
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Prior Experience</h1>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8">
            Tell us about your previous renovation experience and design vision.
          </p>
          
          <div className="max-w-2xl space-y-8">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Prior Renovation Experience</h3>
              <p className="text-sm text-gray-500">Have you renovated before? Tell us about your experience.</p>
              <Textarea 
                value={priorExperience.priorRenovationExperience}
                onChange={(e) => handleUpdateField("priorRenovationExperience", e.target.value)}
                placeholder="Describe your previous renovation experiences..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Design Vision</h3>
              <p className="text-sm text-gray-500">What's your overall vision for this project?</p>
              <Textarea 
                value={priorExperience.designVision}
                onChange={(e) => handleUpdateField("designVision", e.target.value)}
                placeholder="Describe your design vision..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Additional Notes</h3>
              <p className="text-sm text-gray-500">Anything else you'd like to share about this project?</p>
              <Textarea 
                value={priorExperience.additionalNotes}
                onChange={(e) => handleUpdateField("additionalNotes", e.target.value)}
                placeholder="Add any other relevant information..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button 
                onClick={handleBack}
                variant="outline"
                className="border-[#174c65] text-[#174c65]"
              >
                Previous Step
              </Button>
              
              <Button 
                onClick={handleNext}
                className="bg-[#174c65] hover:bg-[#174c65]/90 text-white"
              >
                Next Step
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorExperience;
