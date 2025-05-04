import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus, PhoneIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import CoachPreferenceSelector from "@/components/project/create/CoachPreferenceSelector";
import ContactInfoForm from "@/components/project/create/ContactInfoForm";
import TimeSlotSelector from "@/components/project/create/TimeSlotSelector";
import TimeSlotModal from "@/components/project/create/TimeSlotModal";

const ManagementPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  
  const [wantProjectCoach, setWantProjectCoach] = useState<string>("yes");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneType, setPhoneType] = useState<string>("Cell");
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  
  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
      }
      if (location.state.renovationAreas) {
        setRenovationAreas(location.state.renovationAreas);
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
  
  const loadExistingPreferences = async (id: string) => {
    try {
      // First attempt to use the edge function for bypassing RLS issues
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('handle-project-update', {
        method: 'POST',
        body: { 
          projectId: id,
          userId: user?.id
        }
      });

      if (!edgeError && edgeData) {
        // Successfully got data from the edge function
        console.log('Retrieved project data via edge function');
        
        if (edgeData.management_preferences) {
          const prefs = edgeData.management_preferences;
          if (prefs.wantProjectCoach !== undefined) setWantProjectCoach(prefs.wantProjectCoach);
          if (prefs.phoneNumber) setPhoneNumber(prefs.phoneNumber);
          if (prefs.phoneType) setPhoneType(prefs.phoneType);
          if (prefs.timeSlots && prefs.timeSlots.length > 0) {
            setTimeSlots(prefs.timeSlots);
            setShowTimeSlots(prefs.wantProjectCoach === 'yes');
          }
        }
        return;
      }
      
      // Fallback to direct query - this will only work if RLS permissions allow
      const { data, error } = await supabase
        .from('projects')
        .select('management_preferences')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data && data.management_preferences) {
        const prefs = data.management_preferences;
        if (prefs.wantProjectCoach !== undefined) setWantProjectCoach(prefs.wantProjectCoach);
        if (prefs.phoneNumber) setPhoneNumber(prefs.phoneNumber);
        if (prefs.phoneType) setPhoneType(prefs.phoneType);
        if (prefs.timeSlots && prefs.timeSlots.length > 0) {
          setTimeSlots(prefs.timeSlots);
          setShowTimeSlots(prefs.wantProjectCoach === 'yes');
        }
      }
    } catch (error) {
      console.error('Error loading management preferences:', error);
      toast({
        title: "Error",
        description: "Could not load management preferences. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const addTimeSlot = (slot: any) => {
    // Generate a unique ID for the time slot
    slot.id = timeSlots.length + 1;
    setTimeSlots([...timeSlots, slot]);
    setIsTimeSlotModalOpen(false);
  };
  
  const removeTimeSlot = (index: number) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots.splice(index, 1);
    setTimeSlots(newTimeSlots);
  };
  
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
    
    const managementPreferences = {
      wantProjectCoach,
      phoneNumber,
      phoneType,
      timeSlots: wantProjectCoach === 'yes' ? timeSlots : []
    };
    
    if (projectId) {
      try {
        // First try using the edge function (bypasses RLS issues)
        const { data: updateData, error: updateError } = await supabase.functions.invoke(
          'handle-project-update',
          {
            method: 'POST',
            body: { 
              projectId,
              userId: user.id,
              managementPreferences: managementPreferences as Json
            }
          }
        );

        if (updateError) {
          console.error('Error updating via edge function:', updateError);
          
          // Fall back to direct update
          const { error } = await supabase
            .from('projects')
            .update({
              management_preferences: managementPreferences as Json
            })
            .eq('id', projectId);

          if (error) throw error;
        }
        
        // If user wants a coach and provided time slots, send notification to coaches
        if (wantProjectCoach === 'yes' && timeSlots.length > 0) {
          try {
            const { data, error } = await supabase.functions.invoke(
              'notify-coaches-for-new-projects',
              {
                method: 'POST',
                body: { 
                  projectId,
                  managementPreferences
                }
              }
            );
            
            if (error) {
              console.error('Error notifying coaches:', error);
            } else {
              console.log('Coach notification response:', data);
            }
          } catch (notifyError) {
            console.error('Error calling coach notification function:', notifyError);
          }
        }
        
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
        setIsLoading(false);
        return;
      }
    } else {
      console.log("No project ID available, storing preferences in state only");
    }
    
    const updatedProjectPrefs = {
      ...projectPrefs,
      projectId,
      propertyId,
      managementPreferences
    };
    
    setProjectPrefs(updatedProjectPrefs);
    setIsLoading(false);
    
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

  const handleCoachPreferenceChange = (value: string) => {
    setWantProjectCoach(value);
    setShowTimeSlots(value === 'yes');
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
            Let us know if you would like a project coach to guide you through the renovation process.
          </p>
          
          <div className="space-y-8 mb-10">
            <CoachPreferenceSelector
              wantProjectCoach={wantProjectCoach}
              onValueChange={handleCoachPreferenceChange}
            />
            
            {wantProjectCoach === 'yes' && (
              <>
                <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <ContactInfoForm
                    phoneNumber={phoneNumber}
                    phoneType={phoneType}
                    onPhoneNumberChange={setPhoneNumber}
                    onPhoneTypeChange={setPhoneType}
                  />
                </div>
                
                <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Schedule a Meeting</h3>
                  <TimeSlotSelector
                    timeSlots={timeSlots}
                    onAddTimeSlot={() => setIsTimeSlotModalOpen(true)}
                    onRemoveTimeSlot={removeTimeSlot}
                  />
                </div>
                
                <TimeSlotModal
                  isOpen={isTimeSlotModalOpen}
                  onClose={() => setIsTimeSlotModalOpen(false)}
                  onAddTimeSlot={addTimeSlot}
                />
              </>
            )}
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
