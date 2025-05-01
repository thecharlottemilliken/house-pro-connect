
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { toast } from "sonner";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const roomOptions = [
  "Kitchen", "Bathroom", "Living Room", "Dining Room", "Primary Bedroom", 
  "Guest Bedroom", "Office", "Basement", "Attic", "Garage", "Outdoor Space", 
  "Laundry Room", "Other"
];

const RenovationAreas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const [selectedAreas, setSelectedAreas] = useState<Array<{area: string, location?: string}>>([]);
  const [otherRoomName, setOtherRoomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (location.state) {
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      if (location.state.propertyName) {
        setPropertyName(location.state.propertyName);
      }
      
      // If we have existing renovation areas, load them
      if (location.state.renovationAreas && Array.isArray(location.state.renovationAreas)) {
        setSelectedAreas(location.state.renovationAreas);
      }
    } else {
      toast.error("No property selected");
      navigate("/create-project");
    }
  }, [location.state, navigate, user]);

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => {
      // Check if this area already exists in the array
      const exists = prev.some(item => item.area === area);
      
      if (exists) {
        // Remove it if it exists
        return prev.filter(item => item.area !== area);
      } else {
        // Add it if it doesn't exist
        return [...prev, { area }];
      }
    });
  };

  const addOtherRoom = () => {
    if (otherRoomName.trim()) {
      setSelectedAreas(prev => [...prev, { area: otherRoomName.trim() }]);
      setOtherRoomName("");
    }
  };

  const continueToNextStep = () => {
    if (selectedAreas.length === 0) {
      toast.error("Please select at least one renovation area");
      return;
    }

    // Continue to next step with all collected data
    navigate("/project-preferences", {
      state: {
        propertyId,
        propertyName,
        renovationAreas: selectedAreas
      }
    });
  };

  const goBack = () => {
    navigate("/create-project");
  };

  const steps = [
    { number: 1, title: "Select a Property", current: false },
    { number: 2, title: "Select Renovation Areas", current: true },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
            Select Renovation Areas
          </h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            Select all the areas of your property that will be included in this renovation project.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {roomOptions.map((room) => (
                  <div key={room} className="flex items-center space-x-3 p-3 border rounded-lg bg-white hover:bg-gray-50">
                    <Checkbox 
                      id={`room-${room}`} 
                      checked={selectedAreas.some(item => item.area === room)}
                      onCheckedChange={() => handleAreaToggle(room)}
                    />
                    <label
                      htmlFor={`room-${room}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                    >
                      {room}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex items-end gap-2 mb-8">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block text-gray-700">
                    Add another area
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter area name"
                    value={otherRoomName}
                    onChange={(e) => setOtherRoomName(e.target.value)}
                  />
                </div>
                <Button 
                  type="button"
                  onClick={addOtherRoom}
                  variant="outline"
                  className="border-[#174c65] text-[#174c65]"
                  disabled={!otherRoomName.trim()}
                >
                  Add
                </Button>
              </div>
              
              {selectedAreas.length > 0 && (
                <div className="p-4 bg-[#f7f9fa] rounded-lg mb-8">
                  <h3 className="text-lg font-semibold mb-3">Selected Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAreas.map((item, index) => (
                      <div 
                        key={index} 
                        className="bg-[#174c65]/10 text-[#174c65] px-3 py-1 rounded-full flex items-center"
                      >
                        <span>{item.area}</span>
                        <button 
                          onClick={() => setSelectedAreas(prev => prev.filter((_, i) => i !== index))}
                          className="ml-2 h-4 w-4 rounded-full bg-[#174c65]/20 flex items-center justify-center hover:bg-[#174c65]/30"
                        >
                          <span className="sr-only">Remove</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-80 bg-gray-50 p-5 rounded-lg h-fit">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Why we ask about renovation areas</h3>
                <p className="text-sm text-gray-600">
                  Knowing which areas you want to renovate helps us provide better guidance and connect you with the right professionals.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">How this helps your project</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Focused planning",
                      description: "We'll help you create a plan specific to the areas you want to renovate."
                    },
                    {
                      title: "Budget allocation",
                      description: "Understanding your renovation scope helps with budget planning."
                    },
                    {
                      title: "Timeline expectations",
                      description: "Different areas require different timelines for completion."
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
                onClick={continueToNextStep}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "CONTINUE"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenovationAreas;
