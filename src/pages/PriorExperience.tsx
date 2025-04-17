
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PriorExperience = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  const [priorExperience, setPriorExperience] = useState<string>("No");
  const [positiveAspects, setPositiveAspects] = useState<string>("");
  const [negativeAspects, setNegativeAspects] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      if (location.state.propertyName) {
        setPropertyName(location.state.propertyName);
      }
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
      }
      setProjectPrefs(location.state);
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);

  const createProject = async () => {
    if (!user || !propertyId) {
      toast({
        title: "Error",
        description: "Missing required information to create project",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsSubmitting(true);

      // If we already have a project ID, just update it instead of creating a new one
      if (projectId) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            prior_experience: {
              hadPriorExperience: priorExperience,
              positiveAspects,
              negativeAspects
            }
          })
          .eq('id', projectId);

        if (updateError) throw updateError;
        
        toast({
          title: "Success",
          description: "Your project has been updated successfully!",
        });
        
        return projectId;
      }

      // Create new project with all collected preferences
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          title: `${propertyName || 'New'} Renovation`,
          renovation_areas: projectPrefs?.renovationAreas || [],
          project_preferences: projectPrefs?.projectPreferences || null,
          construction_preferences: projectPrefs?.constructionPreferences || null,
          design_preferences: projectPrefs?.designPreferences || null,
          management_preferences: projectPrefs?.managementPreferences || null,
          prior_experience: {
            hadPriorExperience: priorExperience,
            positiveAspects,
            negativeAspects
          }
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast({
        title: "Success",
        description: "Your project has been created successfully!",
      });

      return project.id;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create your project. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishProcess = async () => {
    const createdProjectId = await createProject();
    
    if (createdProjectId) {
      navigate("/project-dashboard", {
        state: {
          ...projectPrefs,
          priorExperience: {
            hadPriorExperience: priorExperience,
            positiveAspects,
            negativeAspects
          },
          completed: true,
          projectId: createdProjectId
        }
      });
    }
  };

  const goBack = () => {
    navigate("/management-preferences", {
      state: projectPrefs
    });
  };

  const saveAndExit = async () => {
    const createdProjectId = await createProject();
    
    if (createdProjectId) {
      toast({
        title: "Project Saved",
        description: "Your project has been saved. You can continue later.",
      });
      
      navigate("/projects");
    }
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Prior Experience</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="space-y-8 mb-10">
            <div>
              <h3 className="text-lg font-medium mb-2">Last question</h3>
              <p className="text-gray-600 text-sm mb-6">
                This range will help us understand what you are prepared to invest in this renovation. The final quote will be dependent on the final project specs.
              </p>
              
              <div className="space-y-6">
                <div>
                  <p className="mb-2 font-medium">Have you ever undergone a renovation before?</p>
                  <Select
                    value={priorExperience}
                    onValueChange={setPriorExperience}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {priorExperience === "Yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="mb-2 font-medium">What aspects did you like?</p>
                      <Textarea 
                        placeholder="Placeholder text" 
                        className="min-h-[160px]"
                        value={positiveAspects}
                        onChange={(e) => setPositiveAspects(e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-medium">Are there any aspects you disliked?</p>
                      <Textarea 
                        placeholder="Placeholder text" 
                        className="min-h-[160px]"
                        value={negativeAspects}
                        onChange={(e) => setNegativeAspects(e.target.value)}
                      />
                    </div>
                  </div>
                )}
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
                onClick={saveAndExit}
                disabled={isSubmitting}
              >
                SAVE & EXIT
              </Button>
              <Button
                className="flex items-center bg-[#174c65] hover:bg-[#174c65]/90 text-white w-full sm:w-auto justify-center"
                onClick={finishProcess}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Project..." : "FINISH"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorExperience;
