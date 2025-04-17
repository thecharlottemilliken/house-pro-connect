
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

const ConstructionPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null); // Ensure we have projectId state
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  const [helpLevel, setHelpLevel] = useState<string>("medium"); // "low", "medium", "high"
  const [hasSpecificPros, setHasSpecificPros] = useState<boolean>(false);
  
  // Pro information fields
  const [pros, setPros] = useState([
    { businessName: "", contactName: "", email: "", phone: "", speciality: "" }
  ]);

  // Get the selected property ID and previous data from the location state
  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      
      if (location.state.projectId) {
        setProjectId(location.state.projectId); // Make sure to set projectId
      }
      
      if (location.state.renovationAreas) {
        setRenovationAreas(location.state.renovationAreas);
      }
      
      // Save all project preferences from previous step
      setProjectPrefs(location.state);
      
      // Load existing construction preferences if available
      if (location.state.projectId) {
        loadExistingPreferences(location.state.projectId);
      }
    } else {
      // If no property was selected, go back to the property selection
      navigate("/create-project");
    }
  }, [location.state, navigate]);
  
  // Function to load existing construction preferences
  const loadExistingPreferences = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('construction_preferences')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data && data.construction_preferences) {
        const prefs = data.construction_preferences as any;
        
        if (prefs.helpLevel) setHelpLevel(prefs.helpLevel);
        if (prefs.hasSpecificPros !== undefined) setHasSpecificPros(prefs.hasSpecificPros);
        if (prefs.pros && Array.isArray(prefs.pros) && prefs.pros.length > 0) setPros(prefs.pros);
      }
    } catch (error) {
      console.error('Error loading construction preferences:', error);
    }
  };

  const savePreferences = async () => {
    // If we already have a project ID, update it
    if (projectId) {
      try {
        // Create preferences object as Record<string, Json>
        const preferences: Record<string, Json> = {
          helpLevel,
          hasSpecificPros,
          pros: hasSpecificPros ? pros : []
        };
        
        const { error } = await supabase
          .from('projects')
          .update({
            construction_preferences: preferences
          })
          .eq('id', projectId);

        if (error) throw error;
        
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
      }
    } else {
      // Just log and continue if no project ID (project will be created at the end in PriorExperience)
      console.log("No project ID available, storing preferences in state only");
    }
  };

  const goToNextStep = async () => {
    await savePreferences();
    navigate("/design-preferences", {
      state: {
        ...projectPrefs,
        propertyId,
        projectId,
        constructionPreferences: {
          helpLevel,
          hasSpecificPros,
          pros: hasSpecificPros ? pros : []
        }
      }
    });
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

  const addAnotherPro = () => {
    setPros([...pros, { businessName: "", contactName: "", email: "", phone: "", speciality: "" }]);
  };

  const updatePro = (index: number, field: string, value: string) => {
    const updatedPros = [...pros];
    updatedPros[index] = { ...updatedPros[index], [field]: value };
    setPros(updatedPros);
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Construction Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="space-y-10 mb-10">
            {/* How much help section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">How much help are you looking for?</h3>
              <p className="text-sm text-gray-600 mb-6">
                This range will help us understand what you are prepared to invest in this renovation. 
                The final quote will be dependent on the final project specs.
              </p>
              
              <div className="relative py-6">
                <div className="h-1 bg-gray-200 rounded-full">
                  <div className="absolute h-1 bg-[#E77C2B] rounded-full" style={{ 
                    width: helpLevel === "low" ? "33%" : helpLevel === "medium" ? "66%" : "100%" 
                  }}></div>
                </div>
                
                <div className="flex justify-between mt-2">
                  <div className="w-1/3 text-center">
                    <button 
                      className={`w-4 h-4 rounded-full -mt-4 mb-2 mx-auto block ${helpLevel === "low" ? "bg-[#E77C2B] ring-4 ring-[#E77C2B]/20" : "bg-gray-300"}`}
                      onClick={() => setHelpLevel("low")}
                    ></button>
                    <p className="text-xs font-medium">Do it for me</p>
                  </div>
                  
                  <div className="w-1/3 text-center">
                    <button 
                      className={`w-4 h-4 rounded-full -mt-4 mb-2 mx-auto block ${helpLevel === "medium" ? "bg-[#E77C2B] ring-4 ring-[#E77C2B]/20" : "bg-gray-300"}`}
                      onClick={() => setHelpLevel("medium")}
                    ></button>
                    <p className="text-xs font-medium">I can do some things</p>
                  </div>
                  
                  <div className="w-1/3 text-center">
                    <button 
                      className={`w-4 h-4 rounded-full -mt-4 mb-2 mx-auto block ${helpLevel === "high" ? "bg-[#E77C2B] ring-4 ring-[#E77C2B]/20" : "bg-gray-300"}`}
                      onClick={() => setHelpLevel("high")}
                    ></button>
                    <p className="text-xs font-medium">I can do most of it</p>
                  </div>
                </div>
              </div>
              
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
            </div>
            
            {/* Pro Information section */}
            {hasSpecificPros && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Pro Information</h3>
                
                {pros.map((pro, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Name"
                        value={pro.businessName}
                        onChange={(e) => updatePro(index, "businessName", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Name"
                        value={pro.contactName}
                        onChange={(e) => updatePro(index, "contactName", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="email@gmail.com"
                        value={pro.email}
                        onChange={(e) => updatePro(index, "email", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        placeholder="000 000 0000"
                        value={pro.phone}
                        onChange={(e) => updatePro(index, "phone", e.target.value)}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Speciality
                      </label>
                      <Select 
                        value={pro.speciality} 
                        onValueChange={(value) => updatePro(index, "speciality", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a speciality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="tiling">Tiling</SelectItem>
                            <SelectItem value="plumbing">Plumbing</SelectItem>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="carpentry">Carpentry</SelectItem>
                            <SelectItem value="painting">Painting</SelectItem>
                            <SelectItem value="general">General Contractor</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="flex items-center text-[#174c65] border-[#174c65]"
                  onClick={addAnotherPro}
                >
                  <Plus className="w-4 h-4 mr-2" /> ADD ANOTHER PRO
                </Button>
              </div>
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
