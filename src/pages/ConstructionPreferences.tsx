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
  const [isCreationMode, setIsCreationMode] = useState(false);

  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) setPropertyId(location.state.propertyId);
      if (location.state.projectId) setProjectId(location.state.projectId);
      if (location.state.renovationAreas) setRenovationAreas(location.state.renovationAreas);
      setProjectPrefs(location.state);
      
      const checkProjectExists = async () => {
        if (location.state.projectId) {
          try {
            const { data: projectData, error: projectError } = await supabase
              .from('projects')
              .select('id, user_id')
              .eq('id', location.state.projectId)
              .maybeSingle();
              
            if (projectError) {
              console.error("Error checking project:", projectError);
              setIsCreationMode(true);
            } else if (projectData) {
              if (projectData.user_id === user?.id) {
                setIsCreationMode(false);
                loadExistingPreferences(location.state.projectId);
              } else {
                try {
                  const { data: isMember, error: memberError } = await supabase.functions.invoke(
                    'check-team-membership', {
                      body: { projectId: location.state.projectId, userId: user?.id }
                    }
                  );
                  
                  if (memberError) {
                    console.error("Error checking team membership:", memberError);
                    setIsCreationMode(true);
                  } else if (isMember) {
                    setIsCreationMode(false);
                    loadExistingPreferences(location.state.projectId);
                  } else {
                    setIsCreationMode(true);
                  }
                } catch (error) {
                  console.error("Error calling membership function:", error);
                  setIsCreationMode(true);
                }
              }
            } else {
              setIsCreationMode(true);
            }
          } catch (error) {
            console.error("Error in project check:", error);
            setIsCreationMode(true);
          }
        } else {
          setIsCreationMode(true);
        }
      };
      
      checkProjectExists();
      
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate, user?.id]);

  const loadExistingPreferences = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc(
        'handle_project_update',
        {
          p_project_id: id,
          p_property_id: null,
          p_user_id: null,
          p_title: '',
          p_renovation_areas: null,
          p_project_preferences: null,
          p_construction_preferences: null,
          p_design_preferences: null,
          p_management_preferences: null,
          p_prior_experience: null
        }
      );
      
      if (error) {
        throw error;
      }
      
      const { data: projectData, error: fetchError } = await supabase
        .from('projects')
        .select('construction_preferences')
        .eq('id', id)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (projectData && projectData.construction_preferences) {
        const prefs = projectData.construction_preferences as any;
        
        if (prefs.helpLevel) setHelpLevel(prefs.helpLevel);
        if (prefs.hasSpecificPros !== undefined) setHasSpecificPros(prefs.hasSpecificPros);
        if (prefs.pros && Array.isArray(prefs.pros) && prefs.pros.length > 0) setPros(prefs.pros);
      }
    } catch (error) {
      console.error('Error loading construction preferences:', error);
    }
  };

  const savePreferences = async () => {
    const constructionPreferences: Record<string, Json> = {
      helpLevel,
      hasSpecificPros,
      pros: hasSpecificPros ? pros : []
    };

    if (projectId && !isCreationMode) {
      try {
        try {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .maybeSingle();
            
          if (projectError) throw projectError;
          
          if (projectData && projectData.user_id === user?.id) {
            const { error } = await supabase
              .from('projects')
              .update({
                construction_preferences: constructionPreferences
              })
              .eq('id', projectId);

            if (error) throw error;
          } else {
            const { error } = await supabase.rpc(
              'handle_project_update',
              {
                p_project_id: projectId,
                p_property_id: null,
                p_user_id: user?.id,
                p_title: '',
                p_renovation_areas: null,
                p_project_preferences: null,
                p_construction_preferences: constructionPreferences,
                p_design_preferences: null,
                p_management_preferences: null,
                p_prior_experience: null
              }
            );
            
            if (error) throw error;
          }
        } catch (error) {
          console.error('Error saving via preferred method:', error);
          const { error: directError } = await supabase
            .from('projects')
            .update({
              construction_preferences: constructionPreferences
            })
            .eq('id', projectId);

          if (directError) throw directError;
        }
        
        toast({
          title: "Success",
          description: "Construction preferences saved successfully.",
        });
      } catch (error) {
        console.error('Error saving construction preferences:', error);
        toast({
          title: "Error",
          description: "Failed to save construction preferences",
          variant: "destructive"
        });
        return;
      }
    }
    
    const updatedProjectPrefs = {
      ...projectPrefs,
      propertyId,
      projectId,
      constructionPreferences
    };
    
    setProjectPrefs(updatedProjectPrefs);
    
    navigate("/design-preferences", {
      state: updatedProjectPrefs
    });
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

export default ConstructionPreferences;
