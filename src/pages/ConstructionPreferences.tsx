
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";
import HelpLevelSelector from "@/components/project/create/HelpLevelSelector";
import ProInformationForm from "@/components/project/create/ProInformationForm";
import { useAuth } from "@/contexts/AuthContext";

const ConstructionPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  const [helpLevel, setHelpLevel] = useState<string>("medium");
  const [hasSpecificPros, setHasSpecificPros] = useState<boolean>(false);
  const [pros, setPros] = useState([
    { businessName: "", contactName: "", email: "", phone: "", speciality: "" }
  ]);
  const [isCreationMode, setIsCreationMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) setPropertyId(location.state.propertyId);
      if (location.state.projectId) setProjectId(location.state.projectId);
      if (location.state.renovationAreas) setRenovationAreas(location.state.renovationAreas);
      setProjectPrefs(location.state);
      
      // If we have a projectId, we need to check if this is an existing project or new one
      if (location.state.projectId) {
        console.log("Project ID detected:", location.state.projectId);
        
        const checkExistingProject = async () => {
          try {
            const { data: projectData, error: projectError } = await supabase
              .from('projects')
              .select('id, user_id')
              .eq('id', location.state.projectId)
              .maybeSingle();
              
            if (projectError) {
              console.error("Error checking if project exists:", projectError);
              // If we can't determine, assume creation mode
              setIsCreationMode(true);
              return;
            }
            
            if (projectData) {
              console.log("Existing project found:", projectData);
              // This is an existing project
              setIsCreationMode(false);
              
              // Load existing preferences 
              loadExistingPreferences(location.state.projectId);
            } else {
              // No project found, this is creation mode
              console.log("No existing project found, assuming creation mode");
              setIsCreationMode(true);
            }
          } catch (error) {
            console.error("Error in project check:", error);
            // If we can't determine, assume creation mode
            setIsCreationMode(true);
          }
        };
        
        checkExistingProject();
      } else {
        // No project ID means we're definitely in creation mode
        console.log("No project ID, assuming creation mode");
        setIsCreationMode(true);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate, user?.id]);

  const loadExistingPreferences = async (id: string) => {
    try {
      // Use edge function to bypass RLS issues
      console.log("Loading construction preferences using edge function");
      try {
        const { data, error } = await supabase.functions.invoke(
          'handle-project-update',
          {
            body: { 
              projectId: id,
              userId: user?.id || null,
            }
          }
        );
        
        if (error) {
          throw error;
        }

        // If using the edge function worked, extract the preferences
        if (data && data.construction_preferences) {
          const prefs = data.construction_preferences as any;
          
          if (prefs.helpLevel) setHelpLevel(prefs.helpLevel);
          if (prefs.hasSpecificPros !== undefined) setHasSpecificPros(prefs.hasSpecificPros);
          if (prefs.pros && Array.isArray(prefs.pros) && prefs.pros.length > 0) setPros(prefs.pros);
          
          console.log("Successfully loaded preferences via edge function");
          return;
        }
      } catch (edgeFnError) {
        console.error('Error using edge function:', edgeFnError);
        // Continue to fallback methods
      }
      
      // Fallback 1: Check if user is the project owner
      console.log("Trying direct project query fallback");
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('construction_preferences, user_id')
        .eq('id', id)
        .maybeSingle();
        
      if (projectError) {
        console.error("Project query error:", projectError);
        throw projectError;
      }
      
      if (projectData) {
        // We got project data directly, use it
        if (projectData.construction_preferences) {
          const prefs = projectData.construction_preferences as any;
          
          if (prefs.helpLevel) setHelpLevel(prefs.helpLevel);
          if (prefs.hasSpecificPros !== undefined) setHasSpecificPros(prefs.hasSpecificPros);
          if (prefs.pros && Array.isArray(prefs.pros) && prefs.pros.length > 0) setPros(prefs.pros);
          
          console.log("Successfully loaded preferences via direct project query");
          return;
        }
      }
    } catch (error) {
      console.error('Error loading construction preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load existing preferences",
        variant: "destructive"
      });
    }
  };

  const savePreferences = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare the construction preferences data
      const constructionPreferences: Record<string, Json> = {
        helpLevel,
        hasSpecificPros,
        pros: hasSpecificPros ? pros : []
      };

      console.log("Saving construction preferences:", constructionPreferences);

      if (projectId && !isCreationMode) {
        console.log("Updating existing project:", projectId);

        try {
          // Try edge function first to avoid RLS issues
          const { data, error } = await supabase.functions.invoke(
            'handle-project-update',
            {
              body: {
                projectId: projectId,
                userId: user?.id,
                constructionPreferences
              }
            }
          );
          
          if (error) throw error;
          
          console.log("Successfully updated via edge function:", data);
        } catch (edgeFnError) {
          console.error('Error using edge function:', edgeFnError);
          
          // Fallback: Try direct update
          console.log("Attempting direct project update as fallback");
          const { error: updateError } = await supabase
            .from('projects')
            .update({
              construction_preferences: constructionPreferences
            })
            .eq('id', projectId);

          if (updateError) throw updateError;
        }
        
        toast({
          title: "Success",
          description: "Construction preferences saved successfully.",
        });
      }
      
      const updatedProjectPrefs = {
        ...projectPrefs,
        propertyId,
        projectId,
        constructionPreferences
      };
      
      console.log("Updated project preferences with construction preferences:", updatedProjectPrefs);
      setProjectPrefs(updatedProjectPrefs);
      
      navigate("/design-preferences", {
        state: updatedProjectPrefs
      });
    } catch (error) {
      console.error('Error saving construction preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save construction preferences",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = async () => {
    await savePreferences();
  };

  const goBack = () => {
    navigate("/project-preferences", {
      state: { 
        ...projectPrefs,
        propertyId,
        projectId 
      }
    });
  };

  const updatePro = (index: number, field: string, value: string) => {
    const updatedPros = [...pros];
    updatedPros[index] = { ...updatedPros[index], [field]: value };
    setPros(updatedPros);
  };

  const addAnotherPro = () => {
    setPros([...pros, { businessName: "", contactName: "", email: "", phone: "", speciality: "" }]);
  };

  const steps = [
    { number: 1, title: "Select a Property", current: false },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: true },
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Construction Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="space-y-10 mb-10">
            <HelpLevelSelector 
              helpLevel={helpLevel} 
              onHelpLevelChange={setHelpLevel} 
            />
            
            <div className="flex items-start mt-6">
              <Checkbox 
                id="specificPros" 
                checked={hasSpecificPros}
                onCheckedChange={(checked) => setHasSpecificPros(!!checked)}
                className="mt-1 border-gray-400"
              />
              <label htmlFor="specificPros" className="ml-2 text-sm">
                I have specific pros I want to work with
              </label>
            </div>
            
            {hasSpecificPros && (
              <ProInformationForm
                pros={pros}
                onProUpdate={updatePro}
                onAddPro={addAnotherPro}
              />
            )}
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

export default ConstructionPreferences;
