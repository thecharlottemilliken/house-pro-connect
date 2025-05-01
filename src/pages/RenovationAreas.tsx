
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { toast } from "sonner";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectData } from "@/hooks/useProjectData";

// Standard room options that should be available for all properties
const standardRoomOptions = [
  "Kitchen", "Bathroom", "Living Room", "Dining Room", "Primary Bedroom", 
  "Guest Bedroom", "Office", "Basement", "Attic", "Garage", "Outdoor Space", 
  "Laundry Room"
];

const locationOptions = [
  "First Floor", "Second Floor", "Third Floor", "Basement", "Ground Floor", "Attic"
];

const RenovationAreas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const [selectedAreas, setSelectedAreas] = useState<Array<{area: string, location?: string}>>([]);
  const [selectedAreaType, setSelectedAreaType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roomOptions, setRoomOptions] = useState<string[]>(standardRoomOptions);
  
  // Fetch property details to get additional rooms if available
  const { propertyDetails } = useProjectData(undefined, location.state);

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

  // Update room options when property details are loaded
  useEffect(() => {
    if (propertyDetails) {
      // Get any additional rooms from the property data if available
      const propertyRooms: string[] = [];
      
      // This is where we would extract rooms from property details
      // For example, if propertyDetails has a rooms array or specific room fields
      
      // Combine standard room options with property-specific rooms
      // Use a Set to ensure no duplicates
      const combinedOptions = Array.from(new Set([...standardRoomOptions, ...propertyRooms]));
      setRoomOptions(combinedOptions);
      
      console.log("Combined room options:", combinedOptions);
    }
  }, [propertyDetails]);

  const addArea = () => {
    if (!selectedAreaType) {
      toast.error("Please select an area type");
      return;
    }

    const newArea = {
      area: selectedAreaType,
      location: selectedLocation || undefined
    };

    setSelectedAreas(prev => [...prev, newArea]);
    setSelectedAreaType("");
    setSelectedLocation("");
  };

  const removeArea = (index: number) => {
    setSelectedAreas(prev => prev.filter((_, i) => i !== index));
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

  const saveAndExit = () => {
    navigate("/dashboard");
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Select Renovation Areas
          </h2>
          <p className="text-gray-700 mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-6">Add Areas</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Area
                  </label>
                  <Select
                    value={selectedAreaType}
                    onValueChange={setSelectedAreaType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select area type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomOptions.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Location
                  </label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={addArea}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white"
                  disabled={!selectedAreaType}
                >
                  ADD AREA
                </Button>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-6">Renovation Areas</h3>
              
              {selectedAreas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No areas added yet</p>
              ) : (
                <div className="space-y-4">
                  {selectedAreas.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <h4 className="font-medium">{item.area} {index + 1}</h4>
                        {item.location && <p className="text-sm text-gray-600">{item.location}</p>}
                      </div>
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700 hover:bg-transparent"
                        onClick={() => removeArea(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={goBack}
              disabled={isLoading}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={saveAndExit}
                disabled={isLoading}
              >
                SAVE & EXIT
              </Button>
              <Button
                className="bg-[#174c65] hover:bg-[#174c65]/90 text-white flex items-center"
                onClick={continueToNextStep}
                disabled={isLoading}
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

export default RenovationAreas;
