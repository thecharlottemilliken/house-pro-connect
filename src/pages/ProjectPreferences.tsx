
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ProjectPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [budget, setBudget] = useState<number>(50000);
  const [useFinancing, setUseFinancing] = useState<boolean>(false);
  const [completionDate, setCompletionDate] = useState<string>("");
  const [readiness, setReadiness] = useState<string>("");
  const [isLifeEventDependent, setIsLifeEventDependent] = useState<boolean>(false);
  const [eventDate, setEventDate] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");

  // Get the selected property ID and renovation areas from the location state
  useEffect(() => {
    if (location.state?.propertyId) {
      setPropertyId(location.state.propertyId);
      if (location.state.renovationAreas) {
        setRenovationAreas(location.state.renovationAreas);
      }
    } else {
      // If no property was selected, go back to the property selection
      navigate("/create-project");
    }
  }, [location.state, navigate]);

  const goToNextStep = () => {
    // Here we would save the project preferences and go to the next step
    console.log("Selected property ID:", propertyId);
    console.log("Renovation areas:", renovationAreas);
    console.log("Budget:", budget);
    console.log("Use financing:", useFinancing);
    console.log("Completion date:", completionDate);
    console.log("Readiness:", readiness);
    console.log("Is life event dependent:", isLifeEventDependent);
    console.log("Event date:", eventDate);
    console.log("Event name:", eventName);
    
    // Navigate to the next step (Construction Preferences)
    navigate("/construction-preferences", {
      state: {
        propertyId,
        renovationAreas,
        budget,
        useFinancing,
        completionDate,
        readiness,
        isLifeEventDependent,
        eventDate,
        eventName
      }
    });
  };

  const goBack = () => {
    navigate("/renovation-areas", {
      state: { propertyId }
    });
  };

  const steps = [
    { number: 1, title: "Select a Property", current: false },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: true },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Sidebar */}
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
        
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Project Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 space-y-10">
              {/* Budget Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Budget</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is your preferred budget range?
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    This range will help us understand what you are prepared to invest in this renovation. 
                    The final quote will be dependent on the final project specs.
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <Checkbox
                      id="financing"
                      checked={useFinancing}
                      onCheckedChange={(checked) => setUseFinancing(!!checked)}
                      className="border-gray-400"
                    />
                    <label htmlFor="financing" className="ml-2 text-sm text-gray-700">
                      I am open to using financing and would like to learn about my options.
                    </label>
                  </div>
                  
                  <div className="mt-6 mb-2">
                    <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 w-full">
                        <div className="h-2 bg-[#f0f0f0] rounded-full">
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-4 border-orange-500 rounded-full"></div>
                        </div>
                      </div>
                      <Slider 
                        value={[budget]} 
                        min={5000} 
                        max={100000} 
                        step={1000}
                        onValueChange={(value) => setBudget(value[0])}
                        className="mt-6"
                      />
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <span className="text-sm font-medium">$5,000</span>
                      <div className="text-center">
                        <span className="bg-[#174c65] text-white text-xs px-3 py-1 rounded">Suggested</span>
                      </div>
                      <span className="text-sm font-medium">$100,000</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timeline Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ideal completion date
                    </label>
                    <Select value={completionDate} onValueChange={setCompletionDate}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="1month">Within 1 month</SelectItem>
                          <SelectItem value="3months">Within 3 months</SelectItem>
                          <SelectItem value="6months">Within 6 months</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How ready are you?
                    </label>
                    <Select value={readiness} onValueChange={setReadiness}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="ready">Ready to start</SelectItem>
                          <SelectItem value="planning">Still planning</SelectItem>
                          <SelectItem value="exploring">Just exploring</SelectItem>
                          <SelectItem value="unsure">Not sure yet</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center mb-4">
                    <Checkbox
                      id="lifeEvent"
                      checked={isLifeEventDependent}
                      onCheckedChange={(checked) => setIsLifeEventDependent(!!checked)}
                      className="border-gray-400"
                    />
                    <label htmlFor="lifeEvent" className="ml-2 text-sm text-gray-700">
                      This timeline is dependent on a life event
                    </label>
                  </div>
                  
                  {isLifeEventDependent && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Date
                        </label>
                        <Input 
                          type="date" 
                          value={eventDate} 
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name of the Event
                        </label>
                        <Input 
                          type="text" 
                          value={eventName} 
                          onChange={(e) => setEventName(e.target.value)}
                          placeholder="Event Name"
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Information Panel */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">How estimates work</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lorem ipsum dolor sit amet consectetur. Pellentesque feugiat augue enim fringilla orci elit tincidunt at. Id fames ut sapien etiam pulvinar. Non posuere vel sit sed morbi sit cursus magna id. Ut blandit cras etiam est amet maecenas.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-4">Getting to a final proposal</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-gray-700 mt-1 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium">Step one description here</h4>
                    <p className="text-xs text-gray-500">
                      Lorem ipsum dolor sit amet consectetur. Pellentesque feugiat augue enim fringilla orci elit tincidunt at.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-gray-700 mt-1 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium">Step one description here</h4>
                    <p className="text-xs text-gray-500">
                      Lorem ipsum dolor sit amet consectetur. Pellentesque feugiat augue enim fringilla orci elit tincidunt at.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-gray-700 mt-1 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium">Step one description here</h4>
                    <p className="text-xs text-gray-500">
                      Lorem ipsum dolor sit amet consectetur. Pellentesque feugiat augue enim fringilla orci elit tincidunt at.
                    </p>
                  </div>
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

export default ProjectPreferences;
