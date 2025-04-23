
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
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

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
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);

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
        
        // Check if this is an existing project
        const checkExistingProject = async () => {
          try {
            const { data, error } = await supabase
              .from('projects')
              .select('id')
              .eq('id', location.state.projectId)
              .maybeSingle();
              
            if (error) throw error;
            
            if (data) {
              setIsUpdatingExisting(true);
              loadExistingPriorExperience(location.state.projectId);
            } else {
              setIsUpdatingExisting(false);
            }
          } catch (error) {
            console.error("Error checking project existence:", error);
          }
        };
        
        checkExistingProject();
      }
      setProjectPrefs(location.state);
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);
  
  const loadExistingPriorExperience = async (projectId: string) => {
    try {
      // Try using edge function first
      try {
        const { data, error } = await supabase.functions.invoke(
          'handle-project-update',
          {
            body: { 
              projectId,
              userId: user?.id
            }
          }
        );
        
        if (error) throw error;
        
        if (data && data.prior_experience) {
          const exp = data.prior_experience as any;
          
          if (exp.hadPriorExperience) setPriorExperience(exp.hadPriorExperience);
          if (exp.positiveAspects) setPositiveAspects(exp.positiveAspects);
          if (exp.negativeAspects) setNegativeAspects(exp.negativeAspects);
          return;
        }
      } catch (edgeFnError) {
        console.error("Edge function error:", edgeFnError);
      }
      
      // Fallback to direct query
      const { data, error } = await supabase
        .from('projects')
        .select('prior_experience')
        .eq('id', projectId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data && data.prior_experience) {
        const exp = data.prior_experience as any;
        
        if (exp.hadPriorExperience) setPriorExperience(exp.hadPriorExperience);
        if (exp.positiveAspects) setPositiveAspects(exp.positiveAspects);
        if (exp.negativeAspects) setNegativeAspects(exp.negativeAspects);
      }
    } catch (error) {
      console.error("Error loading prior experience data:", error);
    }
  };

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
      if (projectId && isUpdatingExisting) {
        try {
          // Try edge function first
          console.log("Updating existing project via edge function:", projectId);
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
            'handle-project-update',
            {
              body: {
                projectId,
                userId: user.id,
                priorExperience: {
                  hadPriorExperience: priorExperience,
                  positiveAspects,
                  negativeAspects
                }
              }
            }
          );
          
          if (edgeError) throw edgeError;
          
          console.log("Project updated successfully via edge function:", edgeData);
          
          toast({
            title: "Success",
            description: "Your project has been updated successfully!",
          });
          
          return projectId;
        } catch (edgeFnError) {
          console.error('Edge function error:', edgeFnError);
          
          // Fallback to direct update
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
      }

      console.log('Creating new project with preferences:', {
        propertyId,
        userId: user.id,
        title: `${propertyName || 'New'} Renovation`,
        renovationAreas: projectPrefs?.renovationAreas || [],
        projectPreferences: projectPrefs?.projectPreferences || null,
        constructionPreferences: projectPrefs?.constructionPreferences || null,
        designPreferences: projectPrefs?.designPreferences || null,
        managementPreferences: projectPrefs?.managementPreferences || null
      });

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

      if (projectError) {
        console.error('Error creating project:', projectError);
        throw projectError;
      }

      console.log('Project created successfully:', project);
      
      toast({
        title: "Success",
        description: "Your project has been created successfully!",
      });

      return project.id;
    } catch (error) {
      console.error('Error creating/updating project:', error);
      toast({
        title: "Error",
        description: "Failed to save your project. Please try again.",
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
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Prior Experience</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            Tell us about your previous experience with renovation projects to help us provide better guidance.
          </p>
          
          <div className="space-y-8 mb-10">
            <div>
              <h3 className="text-lg font-medium mb-2">Last question</h3>
              <p className="text-gray-600 text-sm mb-6">
                Your previous experience helps us understand how to better assist you throughout your renovation journey.
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
                        placeholder="Share aspects of previous renovations you enjoyed" 
                        className="min-h-[160px]"
                        value={positiveAspects}
                        onChange={(e) => setPositiveAspects(e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-medium">Are there any aspects you disliked?</p>
                      <Textarea 
                        placeholder="Share aspects of previous renovations you didn't enjoy" 
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
              disabled={isSubmitting}
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
