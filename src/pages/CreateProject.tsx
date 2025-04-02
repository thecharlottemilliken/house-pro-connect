import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Property {
  id: string;
  property_name: string;
  image_url: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
}

const CreateProject = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setProperties(data || []);
      } catch (error: any) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to load your properties. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, [user]);

  const selectProperty = (id: string) => {
    setSelectedPropertyId(id);
  };

  const steps = [
    { number: 1, title: "Select a Property", current: true },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: false },
  ];

  const createInitialProject = async () => {
    if (!selectedPropertyId || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const selectedProperty = properties.find(p => p.id === selectedPropertyId);
      const projectTitle = `${selectedProperty?.property_name || 'Property'} Renovation`;
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          property_id: selectedPropertyId,
          title: projectTitle,
          renovation_areas: []
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      
      navigate("/renovation-areas", { 
        state: { 
          propertyId: selectedPropertyId,
          projectId: data.id 
        } 
      });
      
      toast({
        title: "Project Created",
        description: "Your project has been created successfully."
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const goToNextStep = () => {
    if (!selectedPropertyId) return;
    createInitialProject();
  };
  
  const formatAddress = (property: Property) => {
    return `${property.address_line1}, ${property.city}, ${property.state} ${property.zip_code}`;
  };

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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Select a Property</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Your Properties <span className="text-gray-500">{properties.length}</span></h3>
            <Button 
              variant="outline" 
              className="border-[#174c65] text-[#174c65] hover:bg-[#174c65] hover:text-white w-full sm:w-auto"
              onClick={() => navigate("/add-property")}
            >
              <Plus className="mr-2 h-4 w-4" /> ADD PROPERTY
            </Button>
          </div>
          
          {isLoading ? (
            <div className="py-6 text-center">Loading your properties...</div>
          ) : properties.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center mb-6 md:mb-10">
              <p className="text-gray-600 mb-4">You don't have any properties yet. Add your first property to get started.</p>
              <Button 
                className="bg-[#174c65]"
                onClick={() => navigate("/add-property")}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10">
              {properties.map((property) => (
                <div 
                  key={property.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                    selectedPropertyId === property.id 
                      ? "border-[#174c65] ring-2 ring-[#174c65]/20" 
                      : "border-gray-200"
                  }`}
                >
                  <div className="h-40 md:h-52 overflow-hidden">
                    <img 
                      src={property.image_url} 
                      alt={property.property_name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-base md:text-lg font-semibold mb-2">{property.property_name}</h4>
                    <p className="text-sm md:text-base text-gray-600 mb-4">{formatAddress(property)}</p>
                    <Button 
                      variant={selectedPropertyId === property.id ? "default" : "outline"}
                      className={selectedPropertyId === property.id 
                        ? "w-full bg-[#174c65] text-white" 
                        : "w-full border-[#174c65] text-[#174c65] hover:bg-[#174c65] hover:text-white"}
                      onClick={() => selectProperty(property.id)}
                    >
                      {selectedPropertyId === property.id ? "SELECTED" : "SELECT"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-gray-200 gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              className="flex items-center text-[#174c65] order-2 sm:order-1 w-full sm:w-auto"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="text-[#174c65] border-[#174c65] w-full sm:w-auto"
              >
                SAVE & EXIT
              </Button>
              <Button
                className={`flex items-center ${
                  selectedPropertyId ? "bg-[#174c65] hover:bg-[#174c65]/90" : "bg-gray-300 hover:bg-gray-400"
                } text-white w-full sm:w-auto justify-center`}
                disabled={!selectedPropertyId || isSubmitting}
                onClick={selectedPropertyId ? goToNextStep : undefined}
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

export default CreateProject;
