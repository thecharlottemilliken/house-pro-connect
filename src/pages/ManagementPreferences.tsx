import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ManagementPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  const [wantProjectCoach, setWantProjectCoach] = useState<string>("yes");
  
  const form = useForm({
    defaultValues: {
      phoneNumber: "",
      phoneType: "Cell",
    }
  });

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
      if (location.state.projectId) {
        loadExistingPreferences(location.state.projectId);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);
  
  // Function to load existing management preferences
  const loadExistingPreferences = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('management_preferences')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data && data.management_preferences) {
        const prefs = data.management_preferences as any;
        
        if (prefs.wantProjectCoach) setWantProjectCoach(prefs.wantProjectCoach);
        if (prefs.phoneNumber) form.setValue("phoneNumber", prefs.phoneNumber);
        if (prefs.phoneType) form.setValue("phoneType", prefs.phoneType);
      }
    } catch (error) {
      console.error('Error loading management preferences:', error);
    }
  };

  const savePreferences = async () => {
    // Create management preferences object
    const managementPreferences = {
      wantProjectCoach,
      phoneNumber: form.getValues("phoneNumber"),
      phoneType: form.getValues("phoneType")
    };
    
    // If we already have a project ID, update it
    if (projectId) {
      try {
        const { error } = await supabase
          .from('projects')
          .update({
            management_preferences: managementPreferences
          })
          .eq('id', projectId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Management preferences saved successfully",
        });
      } catch (error) {
        console.error('Error saving management preferences:', error);
        toast({
          title: "Error",
          description: "Failed to save management preferences",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Just log and continue if no project ID (project should have been created in Project Preferences)
      console.log("No project ID available, storing preferences in state only");
    }
    
    // Update the project preferences state
    const updatedProjectPrefs = {
      ...projectPrefs,
      projectId,
      propertyId,
      managementPreferences
    };
    
    setProjectPrefs(updatedProjectPrefs);
    
    // Navigate to next step
    navigate("/prior-experience", {
      state: updatedProjectPrefs
    });
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
        <div className={`${isMobile ? 'w-full' : 'w-80'} bg-[#EFF3F7] p-4 md:p-8`}>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Create a Project</h1>
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
            Lorem ipsum dolor sit amet consectetur.
          </p>
          
          <div className="space-y-4 md:space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-2 md:mr-3 ${
                  step.current ? "bg-[#174c65] text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step.number}
                </div>
                <div>
                  <h3 className={`text-sm md:text-base font-medium ${
                    step.current ? "text-[#174c65]" : "text-gray-500"
                  }`}>
                    Step {step.number}
                  </h3>
                  <p className={`text-xs md:text-sm ${
                    step.current ? "text-black" : "text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Management Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex-1 space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Do you want to work with a project coach?</h3>
                <RadioGroup 
                  value={wantProjectCoach} 
                  onValueChange={setWantProjectCoach}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes, manage it for me</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No, I'll manage it myself</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-sure" id="not-sure" />
                    <Label htmlFor="not-sure">I'm not sure</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {wantProjectCoach === "yes" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">What number should the coach reach you by?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="phone" className="mb-2 block">Phone</Label>
                      <Input 
                        id="phone" 
                        placeholder="000 000 0000" 
                        value={form.watch("phoneNumber")}
                        onChange={(e) => form.setValue("phoneNumber", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneType" className="mb-2 block">Type</Label>
                      <Select 
                        value={form.watch("phoneType")} 
                        onValueChange={(value) => form.setValue("phoneType", value)}
                      >
                        <SelectTrigger id="phoneType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Cell">Cell</SelectItem>
                            <SelectItem value="Home">Home</SelectItem>
                            <SelectItem value="Work">Work</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {wantProjectCoach === "yes" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Please select a few times you're available to be contacted.</h3>
                  
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`date-${index}`} className="mb-2 block">Date</Label>
                        <div className="relative">
                          <Input 
                            id={`date-${index}`} 
                            placeholder="MM / DD / YYYY" 
                            className="pl-10"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.3333 2.66663H2.66667C1.93029 2.66663 1.33334 3.26358 1.33334 3.99996V13.3333C1.33334 14.0697 1.93029 14.6666 2.66667 14.6666H13.3333C14.0697 14.6666 14.6667 14.0697 14.6667 13.3333V3.99996C14.6667 3.26358 14.0697 2.66663 13.3333 2.66663Z" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M1.33334 6.66663H14.6667" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5.33334 1.33337V4.00004" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10.6667 1.33337V4.00004" stroke="#64748B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`time-${index}`} className="mb-2 block">Time</Label>
                        <Input id={`time-${index}`} placeholder="0:00" />
                      </div>
                      <div>
                        <Label htmlFor={`ampm-${index}`} className="mb-2 block">AM/PM</Label>
                        <Select defaultValue="AM">
                          <SelectTrigger id={`ampm-${index}`}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-80 bg-gray-50 p-5 rounded-lg">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">How project management works</h3>
                <p className="text-sm text-gray-600">
                  Lorem ipsum dolor sit amet consectetur. Pellentesque feugiat augue enim fringilla orci elit tincidunt at. Id fames ut sapien etiam pulvinar. Non posuere vel sit sed morbi sit cursus magna id. Ut blandit cras etiam est amet maecenas.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Things a project coach will help with</h3>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-1 mr-3 h-5 w-5 flex items-center justify-center rounded-full bg-[#174c65] text-white">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Step one description here</h4>
                        <p className="text-xs text-gray-600">
                          Lorem ipsum dolor sit amet consectetur. Pellentesque feugiat augue enim fringilla orci elit tincidunt at.
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
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="text-[#174c65] border-[#174c65] w-full sm:w-auto"
                onClick={() => navigate("/dashboard")}
              >
                SAVE & EXIT
              </Button>
              <Button
                className="flex items-center bg-[#174c65] hover:bg-[#174c65]/90 text-white w-full sm:w-auto justify-center"
                onClick={goToNextStep}
              >
                NEXT <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPreferences;
