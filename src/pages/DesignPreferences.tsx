
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { DesignPreferences as DesignPreferencesType } from "@/hooks/useProjectData";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { PropertyFileUpload } from "@/components/property/PropertyFileUpload";
import { FileWithPreview } from "@/components/ui/file-upload";

const DesignPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  const [hasDesigns, setHasDesigns] = useState<boolean>(true);
  
  const [designers, setDesigners] = useState([
    { businessName: "", contactName: "", email: "", phone: "", speciality: "Architecture" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Designer contact information state
  const [designerContactInfo, setDesignerContactInfo] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
  });

  // Consolidated file upload state
  const [designFiles, setDesignFiles] = useState<FileWithPreview[]>([]);

  useEffect(() => {
    if (location.state) {
      if (location.state.propertyId) {
        setPropertyId(location.state.propertyId);
      }
      if (location.state.projectId) {
        setProjectId(location.state.projectId);
      }
      if (location.state.renovationAreas) {
        setRenovationAreas(location.state.renovationAreas);
      }
      setProjectPrefs(location.state);
      
      // Load existing design preferences if available
      if (location.state.projectId) {
        loadExistingPreferences(location.state.projectId);
      }
    } else {
      navigate("/create-project");
    }
  }, [location.state, navigate]);
  
  const loadExistingPreferences = async (id: string) => {
    try {
      // First attempt to use the edge function for bypassing RLS issues
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('handle-project-update', {
        method: 'POST',
        body: { 
          projectId: id,
          userId: user?.id
        }
      });

      if (!edgeError && edgeData) {
        // Successfully got data from the edge function
        console.log('Retrieved project data via edge function');
        
        if (edgeData.design_preferences) {
          const prefs = edgeData.design_preferences as any;
          if (prefs.hasDesigns !== undefined) setHasDesigns(prefs.hasDesigns);
          if (prefs.designers && Array.isArray(prefs.designers) && prefs.designers.length > 0) {
            setDesigners(prefs.designers);
          }
          // Load designer contact information if it exists
          if (prefs.designerContactInfo) {
            setDesignerContactInfo(prefs.designerContactInfo);
          }
          // Load design files if they exist
          if (prefs.designFiles && Array.isArray(prefs.designFiles)) {
            setDesignFiles(prefs.designFiles);
          }
        }
        return;
      }
      
      // Fallback to direct query - this will only work if RLS permissions allow
      console.log('Falling back to direct query for project data');
      const { data, error } = await supabase
        .from('projects')
        .select('design_preferences')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data && data.design_preferences) {
        const prefs = data.design_preferences as any;
        
        if (prefs.hasDesigns !== undefined) setHasDesigns(prefs.hasDesigns);
        if (prefs.designers && Array.isArray(prefs.designers) && prefs.designers.length > 0) {
          setDesigners(prefs.designers);
        }
        // Load designer contact information if it exists
        if (prefs.designerContactInfo) {
          setDesignerContactInfo(prefs.designerContactInfo);
        }
        // Load design files if they exist
        if (prefs.designFiles && Array.isArray(prefs.designFiles)) {
          setDesignFiles(prefs.designFiles.map((file: any) => ({
            ...file,
            status: 'complete'
          })));
        }
      }
    } catch (error) {
      console.error('Error loading design preferences:', error);
      toast({
        title: "Error",
        description: "Could not load design preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFilesUploaded = (files: FileWithPreview[]) => {
    console.log("Files uploaded:", files);
    setDesignFiles(files);
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
    
    // Extract URLs from complete files
    const designFileUrls = designFiles
      .filter(f => f.status === 'complete' && f.url)
      .map(f => f.url);
    
    const designPreferences: Record<string, unknown> = {
      hasDesigns,
      designers: !hasDesigns ? designers : [],
      designerContactInfo: hasDesigns ? designerContactInfo : null,
      beforePhotos: {},
      designFiles: hasDesigns ? designFiles : [],
      designFileUrls: hasDesigns ? designFileUrls : []
    };
    
    console.log("Saving design preferences:", JSON.stringify(designPreferences, null, 2));
    
    if (projectId) {
      try {
        // First try using the edge function (bypasses RLS issues)
        const { data: updateData, error: updateError } = await supabase.functions.invoke('handle-project-update', {
          method: 'POST',
          body: { 
            projectId,
            userId: user.id,
            designPreferences: designPreferences as Json
          }
        });

        if (updateError) {
          console.error('Error updating via edge function:', updateError);
          
          // Fall back to direct update
          const { error } = await supabase
            .from('projects')
            .update({
              design_preferences: designPreferences as Json
            })
            .eq('id', projectId);

          if (error) throw error;
        }
        
        toast({
          title: "Success",
          description: "Design preferences saved successfully",
        });
      } catch (error) {
        console.error('Error saving design preferences:', error);
        toast({
          title: "Error",
          description: "Failed to save design preferences",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    } else {
      console.log("No project ID available, storing preferences in state only");
    }
    
    const updatedProjectPrefs = {
      ...projectPrefs,
      projectId,
      propertyId,
      designPreferences
    };
    
    setProjectPrefs(updatedProjectPrefs);
    setIsLoading(false);
    
    navigate("/management-preferences", {
      state: updatedProjectPrefs
    });
  };

  const goToNextStep = async () => {
    await savePreferences();
  };

  const goBack = () => {
    navigate("/construction-preferences", {
      state: projectPrefs
    });
  };

  const addAnotherDesigner = () => {
    setDesigners([...designers, { businessName: "", contactName: "", email: "", phone: "", speciality: "Architecture" }]);
  };

  const updateDesigner = (index: number, field: string, value: string) => {
    const updatedDesigners = [...designers];
    updatedDesigners[index] = { ...updatedDesigners[index], [field]: value };
    setDesigners(updatedDesigners);
  };

  const updateDesignerContactInfo = (field: string, value: string) => {
    setDesignerContactInfo({
      ...designerContactInfo,
      [field]: value
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Design Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="space-y-8 mb-10">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Have you worked with a designer?</h3>
              
              <RadioGroup 
                value={hasDesigns ? "has-designs" : "need-designer"} 
                onValueChange={(value) => setHasDesigns(value === "has-designs")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="has-designs" id="has-designs" />
                  <Label htmlFor="has-designs">I have designs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="need-designer" id="need-designer" />
                  <Label htmlFor="need-designer">I need a designer</Label>
                </div>
              </RadioGroup>
            </div>
            
            {hasDesigns ? (
              <div className="space-y-4">
                {/* Designer contact information */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold">Designer Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Design Studio Name"
                        value={designerContactInfo.businessName}
                        onChange={(e) => updateDesignerContactInfo("businessName", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Designer's Name"
                        value={designerContactInfo.contactName}
                        onChange={(e) => updateDesignerContactInfo("contactName", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={designerContactInfo.email}
                        onChange={(e) => updateDesignerContactInfo("email", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        placeholder="000 000 0000"
                        value={designerContactInfo.phone}
                        onChange={(e) => updateDesignerContactInfo("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold">Upload your project's design information</h3>
                
                {/* Combined upload area for design plans and specs */}
                <div className="space-y-4">
                  <PropertyFileUpload
                    accept="image/*, .pdf, .dwg, .doc, .docx, .xls"
                    multiple={true}
                    label="Upload Design Plans and Specs"
                    description="Upload your design plans, specifications, and documentation in PNG, JPG, PDF, or document format"
                    initialFiles={designFiles}
                    onFilesUploaded={handleFilesUploaded}
                    roomOptions={[
                      { value: "blueprint", label: "Blueprint" },
                      { value: "floorPlan", label: "Floor Plan" },
                      { value: "elevation", label: "Elevation" },
                      { value: "siteplan", label: "Site Plan" },
                      { value: "materials", label: "Materials" },
                      { value: "fixtures", label: "Fixtures" },
                      { value: "finishes", label: "Finishes" },
                      { value: "electrical", label: "Electrical" },
                      { value: "plumbing", label: "Plumbing" }
                    ]}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Placeholder for designer-finding feature */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Find a Designer</h3>
                  <p className="text-gray-700 mb-6">
                    This feature will help you find and connect with qualified designers for your project. We're currently building this functionality.
                  </p>
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
                    <p className="text-sm">We'll help you find the perfect designer for your project soon! This section is currently under development.</p>
                  </div>
                </div>
                
                {/* Keep the designer information form as a fallback */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Designer Information</h3>
                  
                  {designers.map((designer, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Name"
                          value={designer.businessName}
                          onChange={(e) => updateDesigner(index, "businessName", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Name"
                          value={designer.contactName}
                          onChange={(e) => updateDesigner(index, "contactName", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <Input
                          type="email"
                          placeholder="email@gmail.com"
                          value={designer.email}
                          onChange={(e) => updateDesigner(index, "email", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <Input
                          type="tel"
                          placeholder="000 000 0000"
                          value={designer.phone}
                          onChange={(e) => updateDesigner(index, "phone", e.target.value)}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Speciality
                        </label>
                        <Select 
                          value={designer.speciality} 
                          onValueChange={(value) => updateDesigner(index, "speciality", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a speciality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="Architecture">Architecture</SelectItem>
                              <SelectItem value="Interior Design">Interior Design</SelectItem>
                              <SelectItem value="Landscape Design">Landscape Design</SelectItem>
                              <SelectItem value="Kitchen Design">Kitchen Design</SelectItem>
                              <SelectItem value="Bathroom Design">Bathroom Design</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center text-[#174c65] border-[#174c65]"
                    onClick={addAnotherDesigner}
                  >
                    <Plus className="w-4 h-4 mr-2" /> ADD ANOTHER DESIGNER
                  </Button>
                </div>
              </div>
            )}
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
                onClick={goToNextStep}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "NEXT"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPreferences;
