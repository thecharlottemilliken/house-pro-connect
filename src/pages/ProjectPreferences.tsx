import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addMonths } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const ProjectPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);

  // Project preferences state
  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [projectBudget, setProjectBudget] = useState<string>("");
  const [projectStartDate, setProjectStartDate] = useState<Date | undefined>(undefined);
  const [projectEndDate, setProjectEndDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) setPropertyId(location.state.propertyId);
      if (location.state.propertyName) {
        // Default project name based on property
        setProjectName(location.state.propertyName + " Renovation");
      }
      if (location.state.projectId) setProjectId(location.state.projectId);
      if (location.state.renovationAreas) setRenovationAreas(location.state.renovationAreas);
      setProjectPrefs(location.state);
      
      // If we have a project ID, load existing preferences
      if (location.state.projectId) {
        loadExistingPreferences(location.state.projectId);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);

  const loadExistingPreferences = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('handle-project-update', {
        method: 'POST',
        body: { 
          projectId: id,
          userId: user?.id || null,
        }
      });
      
      if (error) throw error;
      
      // Extract data from project
      if (data) {
        setProjectName(data.title || "");
        
        // Load project_preferences if available
        if (data.project_preferences) {
          const prefs = data.project_preferences as any;
          setProjectDescription(prefs.description || "");
          setProjectBudget(prefs.budget || "");
          
          if (prefs.startDate) {
            setProjectStartDate(new Date(prefs.startDate));
          }
          
          if (prefs.endDate) {
            setProjectEndDate(new Date(prefs.endDate));
          }
        }
      }
    } catch (error) {
      console.error('Error loading project preferences:', error);
    }
  };

  const goToNextStep = () => {
    const projectPreferences = {
      description: projectDescription,
      budget: projectBudget,
      startDate: projectStartDate ? projectStartDate.toISOString() : null,
      endDate: projectEndDate ? projectEndDate.toISOString() : null
    };

    // Pass all collected data to the next step
    const updatedProjectPrefs = {
      ...projectPrefs,
      propertyId,
      projectId,
      propertyName: projectName.replace(" Renovation", ""),
      renovationAreas,
      projectPreferences
    };
    
    console.log("Passing project preferences to next step:", updatedProjectPrefs);
    
    navigate("/construction-preferences", {
      state: updatedProjectPrefs
    });
  };

  const goBack = () => {
    navigate("/renovation-areas", {
      state: { 
        propertyId, 
        projectId,
        propertyName: projectName.replace(" Renovation", "")
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Project Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="space-y-8 mb-10">
            <div>
              <Label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </Label>
              <Input
                type="text"
                id="projectName"
                placeholder="Enter project name"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description
              </Label>
              <Textarea
                id="projectDescription"
                placeholder="Enter project description"
                className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[120px]"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="projectBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Project Budget
              </Label>
              <Input
                type="number"
                id="projectBudget"
                placeholder="Enter project budget"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={projectBudget}
                onChange={(e) => setProjectBudget(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !projectStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {projectStartDate ? (
                        format(projectStartDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={projectStartDate}
                      onSelect={setProjectStartDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Project End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !projectEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {projectEndDate ? (
                        format(projectEndDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={projectEndDate}
                      onSelect={setProjectEndDate}
                      disabled={(date) =>
                        date < (projectStartDate || new Date()) || date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
              >
                SAVE & EXIT
              </Button>
              <Button
                className="flex items-center bg-[#174c65] hover:bg-[#174c65]/90 text-white w-full sm:w-auto justify-center"
                onClick={goToNextStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "NEXT"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreferences;
