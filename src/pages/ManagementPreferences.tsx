
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const ManagementPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>({});
  
  const [selection, setSelection] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (location.state) {
      console.log("Location state received in ManagementPrefs:", location.state);
      
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
        loadExistingPreferences(location.state.projectId);
      }

      if (location.state.propertyName) {
        setPropertyName(location.state.propertyName);
      }
      
      setProjectPrefs(location.state);
    } else {
      navigate("/create-project");
    }
  }, [location, navigate]);

  const loadExistingPreferences = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('management_preferences')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data && data.management_preferences && data.management_preferences.selection) {
        setSelection(data.management_preferences.selection);
      }
    } catch (error) {
      console.error('Error loading management preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsSubmitting(true);
    
    try {
      const managementPreferences = {
        selection
      };
      
      // Store preferences in state
      const updatedPrefs = {
        ...projectPrefs,
        managementPreferences
      };
      
      console.log("Continuing to next step with data:", updatedPrefs);
      
      // No need to save to database here, we'll save everything at the final step
      navigate("/prior-experience", { state: updatedPrefs });
    } catch (error: any) {
      console.error('Error preparing management preferences:', error);
      toast({
        title: "Error",
        description: "Failed to proceed to the next step",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (value: string) => {
    setSelection(prev => 
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const options = [
    {
      value: "full_help",
      label: "Help me with everything",
      description: "I want full support throughout the entire renovation process."
    },
    {
      value: "contractor_rec",
      label: "Help me find contractors",
      description: "I need recommendations for reliable contractors who can handle my specific renovation needs."
    },
    {
      value: "design_support",
      label: "Help me create a design",
      description: "I need assistance developing a cohesive design plan that matches my vision."
    },
    {
      value: "material_rec", 
      label: "Help me select materials",
      description: "I'd like guidance choosing the right materials for my renovation project."
    },
    {
      value: "budget_management",
      label: "Help me manage my budget",
      description: "I need support tracking expenses and making cost-effective decisions throughout my project."
    }
  ];

  const goToNextStep = () => {
    savePreferences();
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
            Tell us how involved you'd like us to be in your project. Select the areas where you'd like our support.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="md:col-span-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 mb-5 p-4 border border-gray-200 rounded-lg hover:border-[#174c65] transition-colors">
                  <Checkbox 
                    checked={selection.includes(option.value)} 
                    onCheckedChange={() => handleCheckboxChange(option.value)}
                    className="mt-1 data-[state=checked]:bg-[#174c65] data-[state=checked]:border-[#174c65]"
                    id={option.value}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={option.value}
                      className="font-medium text-gray-900 block mb-1 cursor-pointer"
                    >
                      {option.label}
                    </label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">How we can help</h3>
              <p className="text-sm text-gray-600 mb-6">
                We offer different levels of support based on your needs. You can choose to have us assist with specific parts of your project or provide comprehensive support from start to finish.
              </p>
              
              <h4 className="font-medium text-gray-900 mb-2">Our support includes:</h4>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Project coordination</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Contractor recommendations</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Design assistance</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Material selection advice</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Budget management tools</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Timeline planning</span>
                </li>
              </ul>
              
              <p className="text-sm text-gray-500">
                You can always adjust your preferences later as your project progresses.
              </p>
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
                {isSubmitting ? "SAVING..." : "NEXT"} {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPreferences;
