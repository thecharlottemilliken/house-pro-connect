import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormItem } from "@/components/ui/form";
const PriorExperience = () => {
  const {
    user
  } = useAuth();
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
    hasPriorExperience: "",
    likes: "",
    dislikes: "",
    designVision: "",
    additionalNotes: ""
  });
  const steps = [{
    number: 1,
    title: "Select a Property",
    current: false
  }, {
    number: 2,
    title: "Select Renovation Areas",
    current: false
  }, {
    number: 3,
    title: "Project Preferences",
    current: false
  }, {
    number: 4,
    title: "Construction Preferences",
    current: false
  }, {
    number: 5,
    title: "Design Preferences",
    current: false
  }, {
    number: 6,
    title: "Management Preferences",
    current: false
  }, {
    number: 7,
    title: "Prior Experience",
    current: true
  }, {
    number: 8,
    title: "Summary",
    current: false
  }];
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

    // Navigate to the summary step
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
  return <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Prior Experience</h1>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8">
            Tell us about your previous renovation experience and design vision.
          </p>
          
          <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Have you renovated before?</h3>
              
              <RadioGroup value={priorExperience.hasPriorExperience} onValueChange={value => handleUpdateField("hasPriorExperience", value)} className="flex flex-col space-y-1">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="yes" id="r1" />
                  <Label htmlFor="r1">Yes</Label>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="no" id="r2" />
                  <Label htmlFor="r2">No</Label>
                </FormItem>
              </RadioGroup>
            </div>
            
            {priorExperience.hasPriorExperience === "yes" && <>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">What did you like about your past renovation experience?</h3>
                  <Textarea value={priorExperience.likes} onChange={e => handleUpdateField("likes", e.target.value)} placeholder="Share what went well in your previous renovation..." className="min-h-[120px]" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">What did you dislike about your past renovation experience?</h3>
                  <Textarea value={priorExperience.dislikes} onChange={e => handleUpdateField("dislikes", e.target.value)} placeholder="Share what could have gone better..." className="min-h-[120px]" />
                </div>
              </>}
            
            
            
            
            
            <div className="flex items-center justify-between pt-4">
              <Button onClick={handleBack} variant="outline" className="border-[#174c65] text-[#174c65]">
                Previous Step
              </Button>
              
              <Button onClick={handleNext} className="bg-[#174c65] hover:bg-[#174c65]/90 text-white">
                Next Step
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PriorExperience;