import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

interface RenovationArea {
  area: string;
  location: string;
}

interface Property {
  id: string;
  property_name: string;
  bedrooms: string | null;
  bathrooms: string | null;
  living_rooms?: number;
  dining_rooms?: number;
}

const RenovationAreas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [renovationAreas, setRenovationAreas] = useState<RenovationArea[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.propertyId) {
      setPropertyId(location.state.propertyId);
      if (location.state.propertyName) {
        setPropertyName(location.state.propertyName);
      }
      fetchPropertyDetails(location.state.propertyId);
      
      // If there's an existing project ID from saved draft, set it
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
        fetchExistingAreas(location.state.projectId);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);

  const fetchPropertyDetails = async (id: string) => {
    try {
      // For new project creation, don't check team membership, just fetch property details
      const isNewProject = !projectId;
      
      if (isNewProject && user) {
        // For new projects, only check if the user owns the property
        const { data, error } = await supabase.rpc('get_property_details', { p_property_id: id });
        
        if (error) {
          console.error("Error using property details function:", error);
          
          // Fallback to direct query for owner
          const { data: directData, error: directError } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
            
          if (directError) {
            console.error("Error in direct property query:", directError);
            toast({
              title: "Access Error",
              description: "Unable to access this property. Please try again or select another property.",
              variant: "destructive"
            });
            navigate("/create-project");
            return;
          }
          
          setPropertyDetails({
            id: directData.id,
            property_name: directData.property_name,
            bedrooms: directData.bedrooms,
            bathrooms: directData.bathrooms,
            living_rooms: 1,
            dining_rooms: 1
          });
          
          if (!propertyName) {
            setPropertyName(directData.property_name);
          }
          return;
        }
        
        if (data && data.length > 0) {
          const propertyData: Property = {
            id: data[0].id,
            property_name: data[0].property_name,
            bedrooms: data[0].bedrooms,
            bathrooms: data[0].bathrooms,
            living_rooms: 1,
            dining_rooms: 1
          };
          
          setPropertyDetails(propertyData);
          if (!propertyName) {
            setPropertyName(data[0].property_name);
          }
          return;
        }
      } else {
        // For existing projects, check team membership
        try {
          // Use edge function to check team membership without causing recursion
          if (projectId && user) {
            const { data: hasAccess, error: accessError } = await supabase.functions.invoke(
              'check-team-membership', {
                body: { projectId, userId: user.id }
              }
            );
            
            if (accessError || !hasAccess) {
              console.error("Team membership check failed:", accessError);
              toast({
                title: "Access Error",
                description: "You don't have access to this project.",
                variant: "destructive"
              });
              navigate("/dashboard");
              return;
            }
          }
          
          // Use the security definer function
          const { data, error } = await supabase.rpc('get_property_details', { p_property_id: id });
          if (error) throw error;
          
          if (data && data.length > 0) {
            const propertyData: Property = {
              id: data[0].id,
              property_name: data[0].property_name,
              bedrooms: data[0].bedrooms,
              bathrooms: data[0].bathrooms,
              living_rooms: 1,
              dining_rooms: 1
            };
            
            setPropertyDetails(propertyData);
            if (!propertyName) {
              setPropertyName(data[0].property_name);
            }
            return;
          }
        } catch (funcError) {
          console.warn("Function approach failed, trying direct query:", funcError);
        }
      }
      
      // Last resort: direct query
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const propertyData: Property = {
        id: data.id,
        property_name: data.property_name,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        living_rooms: 1,
        dining_rooms: 1
      };
      
      setPropertyDetails(propertyData);
      if (!propertyName) {
        setPropertyName(data.property_name);
      }
    } catch (error: any) {
      console.error('Error fetching property details:', error);
      toast({
        title: "Error",
        description: "Failed to load property details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingAreas = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('renovation_areas')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      if (data && data.renovation_areas) {
        // Parse renovation_areas if it's a string, otherwise use as is
        const areas = Array.isArray(data.renovation_areas) 
          ? data.renovation_areas 
          : (typeof data.renovation_areas === 'string' 
              ? JSON.parse(data.renovation_areas) 
              : []);
        
        setRenovationAreas(areas);
      }
    } catch (error) {
      console.error('Error fetching existing renovation areas:', error);
    }
  };

  const generateAreaOptions = () => {
    const options: string[] = [
      "Kitchen",
      "Garage",
      "Yard/Landscape",
      "Exterior",
      "Attic",
      "Basement",
      "Other"
    ];

    if (propertyDetails) {
      const bedroomsCount = propertyDetails.bedrooms ? parseInt(propertyDetails.bedrooms) : 0;
      for (let i = 1; i <= bedroomsCount; i++) {
        options.push(`Bedroom ${i}`);
      }

      const bathroomsCount = propertyDetails.bathrooms ? parseInt(propertyDetails.bathrooms) : 0;
      for (let i = 1; i <= bathroomsCount; i++) {
        options.push(`Bathroom ${i}`);
      }

      const livingRoomsCount = propertyDetails.living_rooms || 1;
      for (let i = 1; i <= livingRoomsCount; i++) {
        options.push(i === 1 ? "Living Room" : `Living Room ${i}`);
      }

      const diningRoomsCount = propertyDetails.dining_rooms || 1;
      for (let i = 1; i <= diningRoomsCount; i++) {
        options.push(i === 1 ? "Dining Room" : `Dining Room ${i}`);
      }
    }

    return options.sort();
  };

  const addArea = () => {
    if (selectedArea && selectedLocation) {
      const newArea = {
        area: selectedArea,
        location: selectedLocation
      };
      setRenovationAreas([...renovationAreas, newArea]);
      setSelectedArea("");
      setSelectedLocation("");
    }
  };

  const goToNextStep = () => {
    // Navigate to next page with both property ID and project preferences
    navigate("/project-preferences", {
      state: {
        propertyId,
        projectId,
        propertyName,
        renovationAreas
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
    { number: 8, title: "Summary", current: false }
  ];

  const locationOptions = [
    "First Floor",
    "Second Floor",
    "Basement",
    "Attic",
    "Outside",
    "Other"
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Select Renovation Areas</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-6 text-gray-900">Add Areas</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Add Area</label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger className="w-full border border-gray-300 rounded-md py-3">
                      <SelectValue placeholder="Select area type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {generateAreaOptions().map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Select Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full border border-gray-300 rounded-md py-3">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {locationOptions.map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full bg-[#174c65] text-white hover:bg-[#174c65]/90 py-6 text-base rounded-md"
                  onClick={addArea}
                  disabled={!selectedArea || !selectedLocation}
                >
                  ADD AREA
                </Button>
              </div>
            </div>
            
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-6 text-gray-900">Renovation Areas</h3>
              
              {renovationAreas.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  Add areas to renovate using the drop downs to the left.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {renovationAreas.map((item, index) => (
                    <li key={index} className="py-3 flex justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{item.area}</p>
                        <p className="text-sm text-gray-500">{item.location}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700 p-1 h-auto"
                        onClick={() => {
                          const updatedAreas = [...renovationAreas];
                          updatedAreas.splice(index, 1);
                          setRenovationAreas(updatedAreas);
                        }}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
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

export default RenovationAreas;
