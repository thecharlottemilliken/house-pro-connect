import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const DesignPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  
  // Design preferences state
  const [hasDesigns, setHasDesigns] = useState<boolean>(false);
  const [designNotes, setDesignNotes] = useState<string>("");
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
      
      // Check if we have an existing project to load preferences from
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
      
      // Extract the design preferences if available
      if (data && data.design_preferences) {
        const prefs = data.design_preferences as any;
        
        if (prefs.hasDesigns !== undefined) setHasDesigns(prefs.hasDesigns);
        if (prefs.designNotes) setDesignNotes(prefs.designNotes);
      }
    } catch (error) {
      console.error('Error loading design preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load existing design preferences",
        variant: "destructive"
      });
    }
  };

  const goToNextStep = () => {
    try {
      setIsSubmitting(true);
      
      const designPreferences = {
        hasDesigns,
        designNotes: designNotes.trim(),
      };

      console.log("Processing design preferences:", designPreferences);
      
      const updatedProjectPrefs = {
        ...projectPrefs,
        propertyId,
        projectId,
        designPreferences
      };
      
      navigate("/management-preferences", {
        state: updatedProjectPrefs
      });
    } catch (error) {
      console.error('Error processing design preferences:', error);
      toast({
        title: "Error",
        description: "Failed to process design preferences",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate("/construction-preferences", {
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
    { number: 5, title: "Design Preferences", current: true },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Design Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            Let us know about your design preferences for this project.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex-1 space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Do you have existing designs?</h3>
                <RadioGroup 
                  value={hasDesigns ? "yes" : "no"} 
                  onValueChange={(value) => setHasDesigns(value === "yes")}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes, I have existing designs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No, I need design assistance</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="designNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Design Notes
                  </Label>
                  <Textarea 
                    id="designNotes"
                    placeholder="Tell us more about your design preferences"
                    className="min-h-[120px]"
                    value={designNotes}
                    onChange={(e) => setDesignNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-80 bg-gray-50 p-5 rounded-lg">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Why we ask about design preferences</h3>
                <p className="text-sm text-gray-600">
                  Understanding your design preferences helps us tailor our service to better meet your needs.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">How this helps your project</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Personalized service",
                      description: "We'll adjust our guidance based on your design preferences."
                    },
                    {
                      title: "Better recommendations",
                      description: "We can suggest designers and materials based on your preferences."
                    },
                    {
                      title: "Smoother process",
                      description: "Understanding your background helps us anticipate your needs and preferences."
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
                {isSubmitting ? "Loading..." : "NEXT"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPreferences;
