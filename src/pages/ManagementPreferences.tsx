
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";
import { CoachPreferenceSelector } from "@/components/project/create/CoachPreferenceSelector";
import { ContactInfoForm } from "@/components/project/create/ContactInfoForm";
import { TimeSlotSelector } from "@/components/project/create/TimeSlotSelector";
import { TimeSlotModal } from "@/components/project/create/TimeSlotModal";
import { ProjectManagementInfo } from "@/components/project/create/ProjectManagementInfo";
import { 
  TimeSlot, 
  formatTimeSlotsForStorage, 
  parseTimeSlotsFromStorage 
} from "@/utils/timeSlotFormatters";

const ManagementPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  const [wantProjectCoach, setWantProjectCoach] = useState<string>("yes");
  const [isLoading, setIsLoading] = useState(false);
  
  // Time slot state variables
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 1, date: null, time: "", ampm: "AM" },
    { id: 2, date: null, time: "", ampm: "AM" },
    { id: 3, date: null, time: "", ampm: "AM" },
  ]);
  
  // Time slot modal state
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [tempTimeSlot, setTempTimeSlot] = useState<{
    date: Date | null;
    time: string;
    ampm: "AM" | "PM";
  }>({ date: null, time: "", ampm: "AM" });
  
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
          const prefs = edgeData.management_preferences as any;
          
          if (prefs.wantProjectCoach) setWantProjectCoach(prefs.wantProjectCoach);
          if (prefs.phoneNumber) form.setValue("phoneNumber", prefs.phoneNumber);
          if (prefs.phoneType) form.setValue("phoneType", prefs.phoneType);
          if (prefs.timeSlots) {
            // Parse the stored time slots from storage format back to TimeSlot format
            const parsedTimeSlots = parseTimeSlotsFromStorage(prefs.timeSlots);
            setTimeSlots(parsedTimeSlots);
          }
        }
        return;
      }
      
      // Fallback to direct query - this will only work if RLS permissions allow
      console.log('Falling back to direct query for project data');
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
        if (prefs.timeSlots) {
          // Parse the stored time slots
          const parsedTimeSlots = parseTimeSlotsFromStorage(prefs.timeSlots);
          setTimeSlots(parsedTimeSlots);
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

  const openTimeSlotModal = (index: number) => {
    const slot = timeSlots[index];
    setTempTimeSlot({
      date: slot.date,
      time: slot.time,
      ampm: slot.ampm,
    });
    setSelectedSlotIndex(index);
    setIsTimeSlotModalOpen(true);
  };

  const closeTimeSlotModal = () => {
    setIsTimeSlotModalOpen(false);
    setSelectedSlotIndex(null);
  };

  const saveTimeSlot = () => {
    if (selectedSlotIndex === null) return;
    
    const newTimeSlots = [...timeSlots];
    newTimeSlots[selectedSlotIndex] = {
      ...newTimeSlots[selectedSlotIndex],
      date: tempTimeSlot.date,
      time: tempTimeSlot.time,
      ampm: tempTimeSlot.ampm,
    };
    
    setTimeSlots(newTimeSlots);
    closeTimeSlotModal();
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
    
    // Format time slots for storage (convert Date objects to strings)
    const formattedTimeSlots = formatTimeSlotsForStorage(timeSlots);
    
    // Create management preferences object with all the data
    // Make sure all properties are JSON serializable
    const managementPreferences = {
      wantProjectCoach,
      phoneNumber: form.getValues("phoneNumber"),
      phoneType: form.getValues("phoneType"),
      timeSlots: formattedTimeSlots
    };
    
    console.log("Saving management preferences:", managementPreferences);
    
    // If we already have a project ID, update it
    if (projectId) {
      try {
        // First try using the edge function (bypasses RLS issues)
        const { data: updateData, error: updateError } = await supabase.functions.invoke('handle-project-update', {
          method: 'POST',
          body: { 
            projectId,
            userId: user.id,
            managementPreferences
          }
        });

        if (updateError) {
          console.error('Error updating via edge function:', updateError);
          
          // Fall back to direct update
          const { error } = await supabase
            .from('projects')
            .update({
              management_preferences: managementPreferences
            })
            .eq('id', projectId);

          if (error) throw error;
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
    setIsLoading(false);
    
    return updatedProjectPrefs;
  };

  const goToNextStep = async () => {
    const updatedPrefs = await savePreferences();
    if (updatedPrefs) {
      navigate("/prior-experience", {
        state: updatedPrefs
      });
    }
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
        <div className="w-full md:w-80 flex-shrink-0">
          <CreateProjectSteps steps={steps} />
        </div>
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Management Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex-1 space-y-8">
              <CoachPreferenceSelector 
                wantProjectCoach={wantProjectCoach}
                setWantProjectCoach={setWantProjectCoach}
              />
              
              {wantProjectCoach === "yes" && (
                <ContactInfoForm form={form} />
              )}
              
              {wantProjectCoach === "yes" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Please select a few times you're available to be contacted.</h3>
                  
                  <TimeSlotSelector 
                    timeSlots={timeSlots}
                    onEditTimeSlot={openTimeSlotModal}
                    onClearTimeSlot={(index) => {
                      const newTimeSlots = [...timeSlots];
                      newTimeSlots[index] = { ...newTimeSlots[index], date: null, time: "", ampm: "AM" };
                      setTimeSlots(newTimeSlots);
                    }}
                  />
                </div>
              )}
            </div>
            
            <ProjectManagementInfo />
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
                onClick={() => {
                  savePreferences().then(() => navigate("/dashboard"));
                }}
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

      {/* Time Slot Selection Modal */}
      <TimeSlotModal 
        isOpen={isTimeSlotModalOpen}
        onClose={closeTimeSlotModal}
        onSave={saveTimeSlot}
        tempTimeSlot={tempTimeSlot}
        setTempTimeSlot={setTempTimeSlot}
      />
    </div>
  );
};

export default ManagementPreferences;
