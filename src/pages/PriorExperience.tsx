
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const PriorExperience = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  
  // Prior experience form state - split into likes and dislikes
  const [hasPriorExperience, setHasPriorExperience] = useState<boolean>(false);
  const [experienceLikes, setExperienceLikes] = useState<string>("");
  const [experienceDislikes, setExperienceDislikes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Store all data from previous steps
  const [title, setTitle] = useState<string>("New Project");
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [projectPreferences, setProjectPreferences] = useState<any>({});
  const [constructionPreferences, setConstructionPreferences] = useState<any>({});
  const [designPreferences, setDesignPreferences] = useState<any>({});
  const [managementPreferences, setManagementPreferences] = useState<any>({});
  const [propertyName, setPropertyName] = useState<string>("");

  useEffect(() => {
    if (location.state) {
      console.log("Location state received in PriorExperience:", location.state);
      
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
        loadExistingExperienceData(location.state.projectId);
      }
      
      if (location.state.propertyName) {
        setPropertyName(location.state.propertyName);
      }
      
      if (location.state.title) {
        setTitle(location.state.title);
      }
      
      if (location.state.renovationAreas) {
        setRenovationAreas(location.state.renovationAreas);
      }
      
      // Store all preferences data from previous steps
      if (location.state.projectPreferences) {
        setProjectPreferences(location.state.projectPreferences);
      }
      
      if (location.state.constructionPreferences) {
        setConstructionPreferences(location.state.constructionPreferences);
      }
      
      if (location.state.designPreferences) {
        setDesignPreferences(location.state.designPreferences);
      }
      
      if (location.state.managementPreferences) {
        setManagementPreferences(location.state.managementPreferences);
      }
      
      setProjectPrefs(location.state);
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
      
      console.log("Existing project data loaded:", data);
      
      // If we have prior experience data, load it
      if (data && data.prior_experience) {
        const prefs = data.prior_experience as any;
        if (prefs.hasPriorExperience !== undefined) setHasPriorExperience(prefs.hasPriorExperience);
        if (prefs.experienceLikes) setExperienceLikes(prefs.experienceLikes);
        if (prefs.experienceDislikes) setExperienceDislikes(prefs.experienceDislikes);
      }
      
      // Also load all other preferences if available
      if (data) {
        if (data.project_preferences) setProjectPreferences(data.project_preferences);
        if (data.construction_preferences) setConstructionPreferences(data.construction_preferences);
        if (data.design_preferences) setDesignPreferences(data.design_preferences);
        if (data.management_preferences) setManagementPreferences(data.management_preferences);
        if (data.renovation_areas) setRenovationAreas(data.renovation_areas);
        if (data.title) setTitle(data.title);
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
    
    // Create prior experience object - with split likes/dislikes fields
    const prior_experience = {
      hasPriorExperience: hasPriorExperience,
      experienceLikes: experienceLikes,
      experienceDislikes: experienceDislikes
    };
    
    console.log("Saving prior experience:", prior_experience);
    
    try {
      // Get all project preferences from all steps
      const completeProjectData = {
        propertyId: propertyId,
        userId: user.id,
        title: title || "New Project",
        renovationAreas: renovationAreas || [],
        projectPreferences: projectPreferences || {},
        constructionPreferences: constructionPreferences || {},
        designPreferences: designPreferences || {},
        managementPreferences: managementPreferences || {},
        prior_experience
      };
      
      console.log("Finalizing complete project data:", completeProjectData);
      
      // If we already have a project ID, update it with ALL collected data
      if (projectId) {
        const { data, error } = await supabase.functions.invoke('handle-project-update', {
          method: 'POST',
          body: { 
            projectId,
            userId: user.id,
            propertyId: completeProjectData.propertyId,
            title: completeProjectData.title,
            renovationAreas: completeProjectData.renovationAreas,
            projectPreferences: completeProjectData.projectPreferences,
            constructionPreferences: completeProjectData.constructionPreferences,
            designPreferences: completeProjectData.designPreferences,
            managementPreferences: completeProjectData.managementPreferences,
            prior_experience
          }
        });

        if (error) {
          throw error;
        }
        
        console.log("Project updated successfully:", data);
        
        toast({
          title: "Success",
          description: "Project updated successfully!",
        });
        
        // Navigate to project dashboard
        navigate(`/project-dashboard/${projectId}`);
      } else {
        // Create a new project with ALL collected data
        const { data, error } = await supabase.functions.invoke('handle-project-update', {
          method: 'POST',
          body: { 
            userId: user.id,
            propertyId: completeProjectData.propertyId,
            title: completeProjectData.title,
            renovationAreas: completeProjectData.renovationAreas,
            projectPreferences: completeProjectData.projectPreferences,
            constructionPreferences: completeProjectData.constructionPreferences,
            designPreferences: completeProjectData.designPreferences,
            managementPreferences: completeProjectData.managementPreferences,
            prior_experience
          }
        });
        
        if (error) {
          throw error;
        }
        
        const newProjectId = data?.id;
        
        if (!newProjectId) {
          throw new Error("No project ID returned from creation");
        }
        
        console.log("New project created successfully with ID:", newProjectId);
        
        toast({
          title: "Success",
          description: "Project created successfully!",
        });
        
        // Navigate to the project dashboard with the new project ID
        navigate(`/project-dashboard/${newProjectId}`);
      }
    } catch (error) {
      console.error('Error saving all project data:', error);
      toast({
        title: "Error",
        description: "Failed to save project data",
        variant: "destructive"
      });
      setIsLoading(false);
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
        <CreateProjectSteps steps={steps} />
        
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
                  value={hasPriorExperience ? "yes" : "no"} 
                  onValueChange={(value) => setHasPriorExperience(value === "yes")}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes, I have prior renovation experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No, this is my first renovation</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {hasPriorExperience && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="experienceLikes" className="block text-sm font-medium text-gray-700 mb-1">
                      What did you like about your previous renovation experience?
                    </Label>
                    <Textarea 
                      id="experienceLikes"
                      placeholder="Tell us what aspects of your previous renovation you enjoyed"
                      className="min-h-[120px]"
                      value={experienceLikes}
                      onChange={(e) => setExperienceLikes(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="experienceDislikes" className="block text-sm font-medium text-gray-700 mb-1">
                      What did you dislike about your previous renovation experience?
                    </Label>
                    <Textarea 
                      id="experienceDislikes"
                      placeholder="Tell us what aspects of your previous renovation you would change"
                      className="min-h-[120px]"
                      value={experienceDislikes}
                      onChange={(e) => setExperienceDislikes(e.target.value)}
                    />
                  </div>
                </div>
              )}
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
