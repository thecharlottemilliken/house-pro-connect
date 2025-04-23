
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Try to use security definer function first
        const { data: definerData, error: definerError } = await supabase
          .rpc('get_user_properties', { p_user_id: user.id });
          
        if (definerError) {
          console.error('Error fetching properties via security definer:', definerError);
          
          // Fallback to direct query
          const { data: directData, error: directError } = await supabase
            .from('properties')
            .select('*')
            .eq('user_id', user.id);
            
          if (directError) {
            throw directError;
          }
          
          console.log(`Properties fetched via direct query: ${directData?.length}`);
          setProperties(directData || []);
        } else {
          console.log(`Properties fetched via security definer function: ${definerData?.length}`);
          setProperties(definerData || []);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch properties',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const selectProperty = (property: any) => {
    navigate("/renovation-areas", { 
      state: { 
        propertyId: property.id,
        propertyName: property.property_name
      } 
    });
  };
  
  const addNewProperty = () => {
    navigate("/add-property", {
      state: { 
        returnToCreateProject: true
      }
    });
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Create a New Project</h1>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8">
            Select a property for your renovation project or add a new property.
          </p>
          
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#174c65] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Properties Found</h3>
              <p className="text-gray-500 mb-4">Add a property to get started with your renovation project.</p>
              <Button 
                onClick={addNewProperty}
                className="bg-[#174c65] hover:bg-[#174c65]/90 text-white"
              >
                Add New Property
              </Button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div 
                    key={property.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => selectProperty(property)}
                  >
                    <div className="h-40 bg-gray-100">
                      {property.image_url ? (
                        <img 
                          src={property.image_url} 
                          alt={property.property_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{property.property_name}</h3>
                      <p className="text-sm text-gray-500">
                        {property.address_line1}, {property.city}, {property.state} {property.zip_code}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-[#174c65] transition-colors cursor-pointer h-full min-h-[220px]"
                  onClick={addNewProperty}
                >
                  <div className="h-12 w-12 rounded-full bg-[#174c65]/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#174c65]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 text-center">Add a new property</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">Create a new property to renovate</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
