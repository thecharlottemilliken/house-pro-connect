
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { toast } from "@/hooks/use-toast";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const ProjectPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Project preferences form state
  const [timeframe, setTimeframe] = useState<string>("flexible");
  const [budget, setBudget] = useState<string>("moderate");
  const [involvement, setInvolvement] = useState<string>("somewhat");
  const [moveOut, setMoveOut] = useState<string>("yes");
  const [priorities, setPriorities] = useState<string[]>([]);
  
  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (location.state) {
      // Extract data from previous step
      const { propertyId: propId, propertyName: propName, renovationAreas: areas } = location.state;
      
      if (propId) setPropertyId(propId);
      if (propName) setPropertyName(propName);
      if (areas) setRenovationAreas(areas);
      
      // Load existing project preferences if available
      if (location.state.projectPreferences) {
        const prefs = location.state.projectPreferences;
        if (prefs.timeframe) setTimeframe(prefs.timeframe);
        if (prefs.budget) setBudget(prefs.budget);
        if (prefs.involvement) setInvolvement(prefs.involvement);
        if (prefs.moveOut) setMoveOut(prefs.moveOut);
        if (Array.isArray(prefs.priorities)) setPriorities(prefs.priorities);
      }
    } else {
      toast({
        title: "Error",
        description: "Missing renovation areas data",
        variant: "destructive"
      });
      navigate("/create-project");
    }
  }, [location.state, navigate, user]);
  
  const handlePriorityToggle = (value: string) => {
    setPriorities(current => 
      current.includes(value)
        ? current.filter(p => p !== value)
        : [...current, value]
    );
  };
  
  const continueToNextStep = () => {
    // Gather project preferences data
    const projectPreferences = {
      timeframe,
      budget,
      involvement,
      moveOut,
      priorities
    };
    
    // Pass all collected data to the next step
    navigate("/construction-preferences", {
      state: {
        propertyId,
        propertyName,
        renovationAreas,
        projectPreferences,
        // Also pass through existing data if available
        constructionPreferences: location.state?.constructionPreferences,
        designPreferences: location.state?.designPreferences,
        managementPreferences: location.state?.managementPreferences,
        prior_experience: location.state?.prior_experience
      }
    });
  };
  
  const goBack = () => {
    navigate("/renovation-areas", {
      state: {
        propertyId,
        propertyName,
        renovationAreas,
        // Also pass through existing data if available
        projectPreferences: {
          timeframe,
          budget,
          involvement,
          moveOut,
          priorities
        },
        constructionPreferences: location.state?.constructionPreferences,
        designPreferences: location.state?.designPreferences,
        managementPreferences: location.state?.managementPreferences,
        prior_experience: location.state?.prior_experience
      }
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
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
            Project Preferences
          </h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            Let us know your general preferences for this renovation project.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex-1 space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Timeframe</h3>
                <RadioGroup 
                  value={timeframe} 
                  onValueChange={setTimeframe}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asap" id="timeframe-asap" />
                    <Label htmlFor="timeframe-asap">As soon as possible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="within_3_months" id="timeframe-3months" />
                    <Label htmlFor="timeframe-3months">Within 3 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="within_6_months" id="timeframe-6months" />
                    <Label htmlFor="timeframe-6months">Within 6 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flexible" id="timeframe-flexible" />
                    <Label htmlFor="timeframe-flexible">Flexible / Not sure yet</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Budget Range</h3>
                <RadioGroup 
                  value={budget} 
                  onValueChange={setBudget}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="economy" id="budget-economy" />
                    <Label htmlFor="budget-economy">Economy (Basic materials and finishes)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="budget-moderate" />
                    <Label htmlFor="budget-moderate">Moderate (Mid-range materials and finishes)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="budget-premium" />
                    <Label htmlFor="budget-premium">Premium (High-end materials and finishes)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsure" id="budget-unsure" />
                    <Label htmlFor="budget-unsure">Not sure, need guidance</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">How involved do you want to be?</h3>
                <RadioGroup 
                  value={involvement} 
                  onValueChange={setInvolvement}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very" id="involvement-very" />
                    <Label htmlFor="involvement-very">Very involved (Hands-on with decisions and oversight)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="somewhat" id="involvement-somewhat" />
                    <Label htmlFor="involvement-somewhat">Somewhat involved (Key decisions only)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="involvement-minimal" />
                    <Label htmlFor="involvement-minimal">Minimal involvement (Trust professionals to handle most decisions)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Are you willing to move out during renovation?</h3>
                <RadioGroup 
                  value={moveOut} 
                  onValueChange={setMoveOut}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="moveout-yes" />
                    <Label htmlFor="moveout-yes">Yes, I can move out</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="moveout-no" />
                    <Label htmlFor="moveout-no">No, I need to stay in the home</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="moveout-partial" />
                    <Label htmlFor="moveout-partial">Could move out partially or for short periods</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Project Priorities (select all that apply)</h3>
                <div className="space-y-2">
                  {[
                    { id: "speed", label: "Completion speed" },
                    { id: "quality", label: "Quality of work" },
                    { id: "cost", label: "Minimizing costs" },
                    { id: "aesthetics", label: "Aesthetics and design" },
                    { id: "functionality", label: "Functionality and practicality" },
                    { id: "sustainability", label: "Sustainability and eco-friendliness" },
                    { id: "minimal-disruption", label: "Minimal disruption to daily life" }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={priorities.includes(item.id)}
                        onCheckedChange={() => handlePriorityToggle(item.id)}
                      />
                      <label
                        htmlFor={item.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-80 bg-gray-50 p-5 rounded-lg h-fit">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Why we ask about project preferences</h3>
                <p className="text-sm text-gray-600">
                  Understanding your goals, budget, and level of involvement helps us create a renovation plan that matches your expectations and needs.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">How this helps your project</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Tailored recommendations",
                      description: "Get suggestions specific to your budget and preferences."
                    },
                    {
                      title: "Better contractor matches",
                      description: "We can find professionals who align with your priorities."
                    },
                    {
                      title: "Realistic timeline",
                      description: "Set expectations based on your desired level of involvement."
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

export default ProjectPreferences;
