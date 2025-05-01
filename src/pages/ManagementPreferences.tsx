import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const ManagementPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);

  // Management preferences state
  const [managementLevel, setManagementLevel] = useState<string>("full");
  const [availabilityLevel, setAvailabilityLevel] = useState<string>("moderate");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
      }
      setProjectPrefs(location.state);
      
      // If we have an existing project, load preferences
      if (location.state.projectId) {
        loadExistingPreferences(location.state.projectId);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);
  
  const loadExistingPreferences = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'handle-project-update',
        {
          method: 'POST',
          body: { 
            projectId: id,
            userId: user?.id || null,
          }
        }
      );
      
      if (error) throw error;
      
      // Extract management preferences if available
      if (data && data.management_preferences) {
        const prefs = data.management_preferences as any;
        
        if (prefs.managementLevel) setManagementLevel(prefs.managementLevel);
        if (prefs.availabilityLevel) setAvailabilityLevel(prefs.availabilityLevel);
        if (prefs.additionalNotes) setAdditionalNotes(prefs.additionalNotes);
      }
    } catch (error) {
      console.error('Error loading management preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load existing management preferences",
        variant: "destructive"
      });
    }
  };

  const goToNextStep = () => {
    try {
      setIsSubmitting(true);
      
      const managementPreferences = {
        managementLevel,
        availabilityLevel,
        additionalNotes: additionalNotes.trim()
      };

      console.log("Processing management preferences:", managementPreferences);
      
      // Add management preferences to project data to pass to next step
      const updatedProjectPrefs = {
        ...projectPrefs,
        propertyId,
        projectId,
        managementPreferences
      };
      
      navigate("/prior-experience", {
        state: updatedProjectPrefs
      });
    } catch (error) {
      console.error('Error processing management preferences:', error);
      toast({
        title: "Error",
        description: "Failed to process management preferences",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate("/design-preferences", {
      state: { 
        ...projectPrefs,
        propertyId,
        projectId
      }
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
            Let us know your preferences for managing the renovation project.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex-1 space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">How involved do you want to be in the project?</h3>
                <RadioGroup 
                  value={managementLevel} 
                  onValueChange={setManagementLevel}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full">Full Management - I want to be involved in every decision</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderate Management - I want to be involved in key decisions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="limited" id="limited" />
                    <Label htmlFor="limited">Limited Management - I trust the team to handle most decisions</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">How available will you be to answer questions?</h3>
                <RadioGroup 
                  value={availabilityLevel} 
                  onValueChange={setAvailabilityLevel}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High Availability - I can respond quickly to questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderateAvailability" />
                    <Label htmlFor="moderateAvailability">Moderate Availability - I can respond within a day</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">Low Availability - I may take a few days to respond</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </Label>
                <Textarea 
                  id="additionalNotes"
                  placeholder="Any other preferences or notes regarding project management"
                  className="min-h-[120px]"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-80 bg-gray-50 p-5 rounded-lg">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Why we ask about management preferences</h3>
                <p className="text-sm text-gray-600">
                  Understanding your management style and availability helps us tailor our service to better meet your needs.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">How this helps your project</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Tailored communication",
                      description: "We'll adjust our communication style based on your preferences."
                    },
                    {
                      title: "Efficient decision-making",
                      description: "We can streamline the decision-making process based on your availability."
                    },
                    {
                      title: "Better project outcomes",
                      description: "Understanding your involvement level helps us manage the project more effectively."
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-1 mr-3 h-5 w-5 flex items-center justify-center rounded-full bg-[#174c65] text-white">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{item.title}</h4>
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-gray-200 gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              className="flex items-center text-[#174c65] order-2 sm:order-1 w-full sm:w-auto"
              onClick={goBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="text-[#174c65] border-[#174c65] w-full sm:w-auto"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
              >
                SAVE & EXIT
              </Button>
              <Button
                className="flex items-center bg-[#174c65] hover:bg-[#174c65]/90 text-white w-full sm:w-auto justify-center"
                onClick={goToNextStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "NEXT"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPreferences;
