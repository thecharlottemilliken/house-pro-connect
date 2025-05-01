
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";

// Define TimeSlot interface for improved type safety
interface TimeSlot {
  id: number;
  date: Date | null;
  time: string;
  ampm: "AM" | "PM";
}

// Interface for the formatted time slot that can be stored in Supabase
// This needs to be a JSON-serializable object
interface FormattedTimeSlot {
  id: number;
  dateStr: string | null; // ISO string format of the date or null
  time: string;
  ampm: string;
}

// Interface for formatted time slot display
interface FormattedTimeSlotDisplay {
  dayAndDate: string;
  time: string;
}

const ManagementPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
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
  
  // Time range options for the dialog
  const timeRanges = [
    { value: "8:00 - 9:00", label: "8:00 - 9:00" },
    { value: "9:00 - 10:00", label: "9:00 - 10:00" },
    { value: "10:00 - 11:00", label: "10:00 - 11:00" },
    { value: "11:00 - 12:00", label: "11:00 - 12:00" },
    { value: "12:00 - 1:00", label: "12:00 - 1:00" },
    { value: "1:00 - 2:00", label: "1:00 - 2:00" },
    { value: "2:00 - 3:00", label: "2:00 - 3:00" },
    { value: "3:00 - 4:00", label: "3:00 - 4:00" },
    { value: "4:00 - 5:00", label: "4:00 - 5:00" },
  ];
  
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
  
  // Helper function to convert Date objects to strings for JSON serialization
  const formatTimeSlotsForStorage = (slots: TimeSlot[]): Record<string, any>[] => {
    return slots.map(slot => ({
      id: slot.id,
      dateStr: slot.date ? slot.date.toISOString() : null,
      time: slot.time,
      ampm: slot.ampm
    }));
  };
  
  // Helper function to convert stored string dates back to Date objects
  const parseTimeSlotsFromStorage = (formattedSlots: any[]): TimeSlot[] => {
    return formattedSlots.map(slot => ({
      id: slot.id,
      date: slot.dateStr ? new Date(slot.dateStr) : null,
      time: slot.time,
      ampm: slot.ampm as "AM" | "PM"
    }));
  };
  
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

  // Format time slot display to match the UI design
  const formatTimeSlot = (slot: TimeSlot): { dayAndDate: string; time: string } | string => {
    if (!slot.date || !slot.time) {
      return "Select a time and date for your call";
    }
    
    const dayOfWeek = format(slot.date, "EEEE");
    const month = format(slot.date, "MMMM");
    const dayOfMonth = format(slot.date, "do");
    
    // Extract time range parts (e.g., "8:00 - 9:00")
    const timeRange = slot.time;
    const [startTime] = timeRange.split(" - ");
    
    return {
      dayAndDate: `${dayOfWeek}, ${month} ${dayOfMonth}`,
      time: `${startTime}${slot.ampm.toLowerCase()} - ${timeRange.split(" - ")[1]}${slot.ampm.toLowerCase()} EST`
    };
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

  const CreateProjectSteps = ({ steps }) => {
    return (
      <div className="bg-[#EFF3F7] p-4 md:p-8 h-full">
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
    );
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
                  
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="mb-4">
                      {slot.date && slot.time ? (
                        <div className="bg-gray-50 rounded-md p-5 relative">
                          <div className="absolute top-4 right-4 flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => openTimeSlotModal(index)}
                            >
                              <Pencil className="h-5 w-5 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                const newTimeSlots = [...timeSlots];
                                newTimeSlots[index] = { ...newTimeSlots[index], date: null, time: "", ampm: "AM" };
                                setTimeSlots(newTimeSlots);
                              }}
                            >
                              <X className="h-5 w-5 text-gray-600" />
                            </Button>
                          </div>
                          <h4 className="text-lg font-medium mb-1">Time Slot {index + 1}</h4>
                          {(() => {
                            const formattedSlot = formatTimeSlot(slot);
                            if (typeof formattedSlot === 'string') {
                              return <p className="text-sm text-gray-700">{formattedSlot}</p>;
                            } else {
                              return (
                                <>
                                  <p className="text-xl font-normal text-gray-800">
                                    {formattedSlot.dayAndDate}
                                  </p>
                                  <p className="text-xl font-normal text-gray-800">
                                    {formattedSlot.time}
                                  </p>
                                </>
                              );
                            }
                          })()}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between border border-gray-300 rounded-md p-3">
                          <p className="text-sm text-gray-700">
                            Select a time and date for your call
                          </p>
                          <Button 
                            variant="outline" 
                            className="border-gray-300 text-gray-700"
                            onClick={() => openTimeSlotModal(index)}
                          >
                            MAKE SELECTION
                          </Button>
                        </div>
                      )}
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
      <Dialog open={isTimeSlotModalOpen} onOpenChange={setIsTimeSlotModalOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Select a Date and Time Range for a Coach to Reach Out
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeTimeSlotModal}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Date Selection</h3>
              <p className="text-xs text-gray-500">
                Please pick a day when you'd like to talk to us - this is going to be the date we'll try to contact you within, and you'll receive a calendar invite once a time is ready.
              </p>
            </div>
            
            <div className="flex flex-col items-center w-full">
              <CustomDatePicker
                onSelect={(date) => setTempTimeSlot({...tempTimeSlot, date})}
                selectedDate={tempTimeSlot.date}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">AM Times</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeRanges.slice(0, 4).map((range) => (
                  <Button
                    key={range.value}
                    type="button"
                    variant={tempTimeSlot.time === range.value && tempTimeSlot.ampm === "AM" ? "default" : "outline"}
                    className={cn(
                      tempTimeSlot.time === range.value && tempTimeSlot.ampm === "AM" 
                        ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" 
                        : "border-gray-300"
                    )}
                    onClick={() => setTempTimeSlot({...tempTimeSlot, time: range.value, ampm: "AM"})}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">PM Times</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeRanges.slice(4).map((range) => (
                  <Button
                    key={range.value}
                    type="button"
                    variant={tempTimeSlot.time === range.value && tempTimeSlot.ampm === "PM" ? "default" : "outline"}
                    className={cn(
                      tempTimeSlot.time === range.value && tempTimeSlot.ampm === "PM" 
                        ? "bg-[#F97316] text-white hover:bg-[#F97316]/90" 
                        : "border-gray-300"
                    )}
                    onClick={() => setTempTimeSlot({...tempTimeSlot, time: range.value, ampm: "PM"})}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={closeTimeSlotModal}>CANCEL</Button>
            <Button 
              onClick={saveTimeSlot}
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
              disabled={!tempTimeSlot.date || !tempTimeSlot.time}
            >
              SAVE AS COMPLETE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagementPreferences;
