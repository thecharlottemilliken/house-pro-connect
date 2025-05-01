import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const DesignPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPrefs, setProjectPrefs] = useState<any>({});
  
  const [stylePreference, setStylePreference] = useState<string>("");
  const [colorPalette, setColorPalette] = useState<string>("");
  const [materialSelectionHelp, setMaterialSelectionHelp] = useState<boolean>(false);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (location.state) {
      console.log("Location state received in DesignPreferences:", location.state);
      
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
        loadExistingPreferences(location.state.projectId);
      }

      if (location.state.propertyName) {
        setPropertyName(location.state.propertyName);
      }
      
      setProjectPrefs(location.state);
    } else {
      navigate("/create-project");
    }
  }, [location, navigate]);

  const loadExistingPreferences = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('design_preferences')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data && data.design_preferences) {
        const prefs = data.design_preferences as any;
        
        if (prefs.stylePreference) setStylePreference(prefs.stylePreference);
        if (prefs.colorPalette) setColorPalette(prefs.colorPalette);
        if (prefs.materialSelectionHelp !== undefined) setMaterialSelectionHelp(prefs.materialSelectionHelp);
        if (prefs.inspirationImages) setInspirationImages(prefs.inspirationImages);
      }
    } catch (error) {
      console.error('Error loading design preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsSubmitting(true);
    
    try {
      const designPreferences = {
        stylePreference,
        colorPalette,
        materialSelectionHelp,
        inspirationImages
      };
      
      // Store preferences in state
      const updatedPrefs = {
        ...projectPrefs,
        designPreferences
      };
      
      console.log("Continuing to next step with data:", updatedPrefs);
      
      // No need to save to database here, we'll save everything at the final step
      navigate("/management-preferences", { state: updatedPrefs });
    } catch (error: any) {
      console.error('Error preparing design preferences:', error);
      toast({
        title: "Error",
        description: "Failed to proceed to the next step",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: any) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 images
    if (inspirationImages.length + files.length > 3) {
      toast({
        title: "Error",
        description: "You can only upload up to 3 inspiration images.",
        variant: "destructive"
      });
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setInspirationImages(prevImages => [...prevImages, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    setInspirationImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const goToNextStep = () => {
    savePreferences();
  };

  const goBack = () => {
    navigate("/construction-preferences", {
      state: projectPrefs
    });
  };

  const steps = [
    { number: 1, title: "Select a Property", current: false },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: true },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Design Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            Share your design preferences to help us match you with the right specialists.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="md:col-span-2 space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Style
                </label>
                <RadioGroup value={stylePreference} onValueChange={setStylePreference} className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="modern" id="modern" className="data-[state=checked]:bg-[#174c65] data-[state=checked]:border-[#174c65]" />
                    <Label htmlFor="modern">Modern</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="traditional" id="traditional" className="data-[state=checked]:bg-[#174c65] data-[state=checked]:border-[#174c65]" />
                    <Label htmlFor="traditional">Traditional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rustic" id="rustic" className="data-[state=checked]:bg-[#174c65] data-[state=checked]:border-[#174c65]" />
                    <Label htmlFor="rustic">Rustic</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eclectic" id="eclectic" className="data-[state=checked]:bg-[#174c65] data-[state=checked]:border-[#174c65]" />
                    <Label htmlFor="eclectic">Eclectic</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Palette
                </label>
                <input
                  type="text"
                  value={colorPalette}
                  onChange={(e) => setColorPalette(e.target.value)}
                  placeholder="Enter your preferred color palette"
                  className="shadow-sm focus:ring-[#174c65] focus:border-[#174c65] block w-full sm:text-sm border-gray-300 rounded-md py-3"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="materialHelp" 
                  checked={materialSelectionHelp}
                  onCheckedChange={(checked) => setMaterialSelectionHelp(!!checked)}
                  className="data-[state=checked]:bg-[#174c65] data-[state=checked]:border-[#174c65]"
                />
                <label htmlFor="materialHelp" className="text-sm font-medium text-gray-700">
                  I'd like help selecting materials
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspiration Images (up to 3)
                </label>
                <div className="flex space-x-4">
                  {inspirationImages.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
                      <img src={image} alt={`Inspiration ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-80 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {inspirationImages.length < 3 && (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500">
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <input
                          type="file"
                          id="imageUpload"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Upload images that inspire your design (max 3).</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Design tips</h3>
              <p className="text-sm text-gray-600 mb-6">
                Consider the overall style of your home and choose design elements that complement it.
              </p>
              
              <h4 className="font-medium text-gray-900 mb-2">Key design considerations:</h4>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Color schemes</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Material choices</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Furniture selection</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Lighting options</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#174c65] rounded-full mr-2"></div>
                  <span>Layout and space planning</span>
                </li>
              </ul>
              
              <p className="text-sm text-gray-500">
                Our specialists can help you bring your vision to life.
              </p>
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
                {isSubmitting ? "SAVING..." : "NEXT"} {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPreferences;
