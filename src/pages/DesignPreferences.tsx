
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus, Upload } from "lucide-react";
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

const DesignPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [renovationAreas, setRenovationAreas] = useState<any[]>([]);
  const [projectPrefs, setProjectPrefs] = useState<any>(null);
  const [hasDesigns, setHasDesigns] = useState<boolean>(true);
  
  // Designer information fields
  const [designers, setDesigners] = useState([
    { businessName: "", contactName: "", email: "", phone: "", speciality: "Architecture" }
  ]);

  // Get the selected property ID and previous data from the location state
  useEffect(() => {
    if (location.state?.propertyId) {
      setPropertyId(location.state.propertyId);
      if (location.state.renovationAreas) {
        setRenovationAreas(location.state.renovationAreas);
      }
      // Save all project preferences from previous steps
      setProjectPrefs(location.state);
    } else {
      // If no property was selected, go back to the property selection
      navigate("/create-project");
    }
  }, [location.state, navigate]);

  const goToNextStep = () => {
    // Save the design preferences and go to the next step (Management Preferences)
    navigate("/management-preferences", {
      state: {
        ...projectPrefs,
        designPreferences: {
          hasDesigns,
          designers: !hasDesigns ? designers : []
        }
      }
    });
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Design Preferences</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="space-y-8 mb-10">
            {/* Designer option section */}
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
            
            {/* Upload design information section */}
            {hasDesigns && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload your project's design information.</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm mb-1">Upload Design Plan</p>
                      <p className="text-xs text-gray-500 mb-2">PNG, JPG, PDF, or DWG</p>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        className="bg-[#174c65] hover:bg-[#174c65]/90 text-white"
                        onClick={() => {}}
                      >
                        <Upload className="mr-2 h-4 w-4" /> UPLOAD
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm mb-1">Upload Specs</p>
                      <p className="text-xs text-gray-500 mb-2">PNG, JPG, or PDF</p>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        className="bg-[#174c65] hover:bg-[#174c65]/90 text-white"
                        onClick={() => {}}
                      >
                        <Upload className="mr-2 h-4 w-4" /> UPLOAD
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Designer Information section */}
            {!hasDesigns && (
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

export default DesignPreferences;
