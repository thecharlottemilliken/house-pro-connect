
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const ProjectSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state) {
      console.log("Location state received:", JSON.stringify(location.state, null, 2));
      
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
      }
      if (location.state.title) {
        setProjectTitle(location.state.title);
      }
      setProjectPrefs(location.state);
      
      // Load existing project data if available
      if (location.state.projectId) {
        loadExistingProjectData(location.state.projectId);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);
  
  const loadExistingProjectData = async (id: string) => {
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
      
      console.log("Loaded existing project data:", JSON.stringify(data, null, 2));
      
      if (data) {
        if (data.title) setProjectTitle(data.title);
        if (data.description) setProjectDescription(data.description);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      toast({
        title: "Error",
        description: "Could not load project data",
        variant: "destructive"
      });
    }
  };

  const saveProjectSummary = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save project details",
        variant: "destructive"
      });
      return;
    }
    
    if (!projectTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a project title",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Gather all the preferences data from previous steps
      const constructionPreferences = projectPrefs?.constructionPreferences || {};
      const designPreferences = projectPrefs?.designPreferences || {};
      const managementPreferences = projectPrefs?.managementPreferences || {};
      const renovationAreas = projectPrefs?.renovationAreas || [];
      const projectPreferences = projectPrefs?.projectPreferences || {};
      const priorExperience = projectPrefs?.prior_experience || projectPrefs?.priorExperience || {};
      
      console.log("Project prefs before payload construction:", {
        projectId: projectId,
        propertyId: propertyId,
        title: projectTitle,
        description: projectDescription,
        constructionPrefs: JSON.stringify(constructionPreferences),
        designPrefs: JSON.stringify(designPreferences),
        managementPrefs: JSON.stringify(managementPreferences),
        projectPreferences: JSON.stringify(projectPreferences),
        renovationAreas: renovationAreas.length
      });
      
      // If we already have a project ID, update it
      if (projectId) {
        // Construct the final payload with all preference data
        const finalPayload = {
          projectId,
          userId: user.id,
          propertyId: propertyId,
          title: projectTitle,
          description: projectDescription,
          renovationAreas,
          projectPreferences,
          constructionPreferences,
          designPreferences,
          managementPreferences,
          prior_experience: priorExperience
        };
        
        console.log("Updating existing project with ID:", projectId);
        console.log("Final payload being sent to edge function:", JSON.stringify(finalPayload, null, 2));

        try {
          // Use the edge function to update the project
          const { data, error } = await supabase.functions.invoke('handle-project-update', {
            body: finalPayload
          });

          if (error) {
            console.error("Error response from edge function:", error);
            throw error;
          }
          
          console.log("Success response from edge function:", data);
          
          toast({
            title: "Success",
            description: "Project updated successfully!",
          });
          
          // Navigate to project dashboard
          navigate(`/project-dashboard/${projectId}`);
        } catch (error) {
          console.error('Error saving project summary:', error);
          toast({
            title: "Error",
            description: "Failed to save project summary",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      } else {
        // Gather all the preferences data for creating a new project
        const projectData = {
          propertyId: propertyId,
          userId: user.id,
          title: projectTitle,
          description: projectDescription,
          renovationAreas,
          projectPreferences,
          constructionPreferences,
          designPreferences,
          managementPreferences,
          prior_experience: priorExperience
        };

        console.log("Creating new project with data:", JSON.stringify(projectData, null, 2));
        
        // Create a new project with all the collected preferences
        try {
          const { data, error } = await supabase.functions.invoke('handle-project-update', {
            body: projectData
          });

          if (error) {
            console.error("Error response from edge function for creation:", error);
            throw error;
          }
          
          console.log("Success response from edge function for creation:", data);
          
          toast({
            title: "Success",
            description: "Project created successfully!",
          });
          
          // Navigate to project dashboard using the new project ID
          if (data && data.id) {
            navigate(`/project-dashboard/${data.id}`);
          } else {
            console.error("No project ID returned from creation");
            toast({
              title: "Error",
              description: "Project created but ID not returned",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error creating project:', error);
          toast({
            title: "Error",
            description: "Failed to create project",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Error in project creation process:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const finishProcess = async () => {
    await saveProjectSummary();
  };
  
  const goBack = () => {
    navigate("/prior-experience", {
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
    { number: 7, title: "Prior Experience", current: false },
    { number: 8, title: "Project Summary", current: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Project Summary</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            Almost done! Give your project a title and a brief description to help you and your team understand what this project is about.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <Input 
                    type="text" 
                    value={projectTitle} 
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter a name for your project"
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a clear, descriptive title for your renovation project
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Description
                  </label>
                  <Textarea 
                    value={projectDescription} 
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your renovation project in detail..."
                    className="min-h-[200px] w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include details about your vision, goals, and any specific requirements for your renovation
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-80 bg-gray-50 p-5 rounded-lg">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Final Step</h3>
                <p className="text-sm text-gray-600">
                  You've provided all the required information for your renovation project. This final step helps organize and identify your project.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Summary Benefits</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Better organization",
                      description: "A clear title and description makes your project easier to find and reference."
                    },
                    {
                      title: "Clearer communication",
                      description: "Team members will better understand your project's scope and goals."
                    },
                    {
                      title: "Focused vision",
                      description: "Articulating your project helps refine and clarify your renovation vision."
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

export default ProjectSummary;
