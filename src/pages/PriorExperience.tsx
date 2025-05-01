import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PriorExperience = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  
  // Prior experience form state
  const [priorExperienceLevel, setPriorExperienceLevel] = useState<string>("none");
  const [priorExperienceDetail, setPriorExperienceDetail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
      }
      setProjectPrefs(location.state);
      
      // Load existing prior experience data if available
      if (location.state.projectId) {
        loadExistingExperienceData(location.state.projectId);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);
  
  const loadExistingExperienceData = async (id: string) => {
    try {
      // Use the edge function to fetch project data
      const { data, error } = await supabase.functions.invoke('handle-project-update', {
        method: 'POST',
        body: { 
          projectId: id,
          userId: user?.id
        }
      });

      if (error) throw error;
      
      // If we have prior experience data, load it
      if (data && data.prior_experience) {
        const prefs = data.prior_experience as any;
        if (prefs.level) setPriorExperienceLevel(prefs.level);
        if (prefs.detail) setPriorExperienceDetail(prefs.detail);
      }
    } catch (error) {
      console.error('Error loading prior experience data:', error);
      toast({
        title: "Error",
        description: "Could not load prior experience data",
        variant: "destructive"
      });
    }
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
    
    // Create prior experience object
    const prior_experience = {
      level: priorExperienceLevel,
      detail: priorExperienceDetail
    };
    
    console.log("Saving prior experience:", prior_experience);
    
    // If we already have a project ID, update it
    if (projectId) {
      try {
        // Use the edge function to update the project
        const { data, error } = await supabase.functions.invoke('handle-project-update', {
          method: 'POST',
          body: { 
            projectId,
            userId: user.id,
            prior_experience
          }
        });

        if (error) {
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Project created successfully!",
        });
        
        // Navigate to project dashboard
        navigate(`/project/${projectId}`);
      } catch (error) {
        console.error('Error saving prior experience:', error);
        toast({
          title: "Error",
          description: "Failed to save prior experience",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    } else {
      // Project ID should exist by now, so this is an error
      toast({
        title: "Error",
        description: "No project ID available",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
  };

  const finishProcess = async () => {
    await savePreferences();
  };
  
  const goBack = () => {
    navigate("/management-preferences", {
      state: projectPrefs
    });
  };

  const steps = [
    { number: 1, title: "Select a Property", current: false },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full bg-[#EFF3F7] p-4 md:p-8">
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Prior Experience</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            Let us know about any prior renovation experience you might have.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex-1 space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Have you done a renovation before?</h3>
                <RadioGroup 
                  value={priorExperienceLevel} 
                  onValueChange={setPriorExperienceLevel}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">No prior experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="some" id="some" />
                    <Label htmlFor="some">Some prior experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="many" id="many" />
                    <Label htmlFor="many">Many prior experience</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="priorExperienceDetail" className="block text-sm font-medium text-gray-700 mb-1">
                  Tell us a bit about your past renovation projects
                </Label>
                <Textarea 
                  id="priorExperienceDetail"
                  placeholder="What kind of projects have you done before? What went well? What could have been better?"
                  className="min-h-[120px]"
                  value={priorExperienceDetail}
                  onChange={(e) => setPriorExperienceDetail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-80 bg-gray-50 p-5 rounded-lg">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Why we ask about prior experience</h3>
                <p className="text-sm text-gray-600">
                  Understanding your previous renovation experience helps us tailor our service to better meet your needs. If you've done renovations before, we can build on what worked well and avoid what didn't.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">How this helps your project</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Personalized service",
                      description: "We'll adjust our guidance based on your experience level."
                    },
                    {
                      title: "Better recommendations",
                      description: "We can suggest contractors and materials based on what has worked for you before."
                    },
                    {
                      title: "Smoother process",
                      description: "Understanding your background helps us anticipate your needs and preferences."
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
                onClick={finishProcess}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "FINISH"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorExperience;
