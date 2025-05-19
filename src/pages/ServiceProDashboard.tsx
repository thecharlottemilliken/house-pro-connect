
import { useEffect, useState } from "react";
import ServiceProNavbar from "@/components/service-pro/ServiceProNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Plus } from "lucide-react";

// Move interface definition outside the component to prevent recursive type inference
interface ProfileItem {
  id: number;
  text: string;
  completed: boolean;
  route: string;
}

// Define initial items outside component
const initialProfileItems: ProfileItem[] = [
  { id: 1, text: "Add Your License Information", completed: false, route: "/service-pro-profile?section=licenses" },
  { id: 2, text: "Add Your Bio", completed: false, route: "/service-pro-profile?section=basic" },
  { id: 3, text: "List Your Properties", completed: false, route: "/your-properties" }
];

const ServiceProDashboard = () => {
  const { user, profile } = useAuth();
  const [profileComplete, setProfileComplete] = useState(false);
  
  // Use the external initialProfileItems to set the initial state
  const [profileItems, setProfileItems] = useState<ProfileItem[]>([...initialProfileItems]);
  
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('service_pro_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        // Check if license is added
        const { count: licensesCount } = await supabase
          .from('service_pro_licenses')
          .select('*', { count: 'exact', head: true })
          .eq('pro_id', user.id);
          
        // Check if properties exist
        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);
        
        // Create a completely new array without referencing the previous state
        const updatedItems = [
          { 
            id: 1, 
            text: "Add Your License Information", 
            completed: licensesCount > 0,
            route: "/service-pro-profile?section=licenses" 
          },
          { 
            id: 2, 
            text: "Add Your Bio", 
            completed: !!(data?.about_text && data?.about_text.length > 0),
            route: "/service-pro-profile?section=basic" 
          },
          { 
            id: 3, 
            text: "List Your Properties", 
            completed: propertiesCount > 0,
            route: "/your-properties" 
          }
        ] as ProfileItem[];
        
        setProfileItems(updatedItems);
        
        // Calculate profile completion separately
        const completedItems = updatedItems.filter(item => item.completed).length;
        setProfileComplete(completedItems === updatedItems.length);
        
      } catch (error) {
        console.error("Error checking profile completion:", error);
      }
    };
    
    checkProfileCompletion();
  }, [user]);

  const completionPercentage = Math.round(
    (profileItems.filter(item => item.completed).length / profileItems.length) * 100
  );

  return (
    <div className="min-h-screen bg-white">
      <ServiceProNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome,</h1>
          <p className="text-2xl text-gray-800 mt-1">{profile?.full_name || profile?.name || user?.user_metadata?.full_name || 'Service Pro'}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile completion card */}
          <Card className="border rounded-md overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Finish Setting Up Your Profile</h2>
                <span className="text-sm font-medium">{completionPercentage}% Complete</span>
              </div>
              
              <Progress value={completionPercentage} className="h-2 mb-6" />
              
              <div className="space-y-4">
                {profileItems.map((item) => (
                  <div key={item.id} className="flex items-center bg-gray-50 p-4 rounded-md">
                    <div className="h-8 w-8 rounded-full bg-gray-700 text-white flex items-center justify-center mr-4">
                      {item.id}
                    </div>
                    <span className="flex-grow">{item.text}</span>
                    <Link to={item.route}>
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                        {item.completed ? (
                          <Check className="h-5 w-5 text-green-500 mr-1" />
                        ) : (
                          <span className="uppercase">Add {item.id === 1 ? "information" : item.id === 2 ? "bio" : "properties"}</span>
                        )}
                        {!item.completed && <ArrowRight className="h-4 w-4 ml-1" />}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Your Projects card */}
          <Card className="border rounded-md overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Your Projects</h2>
              <div className="border border-dashed rounded-md p-6 text-center">
                <p className="text-gray-500 mb-4">You Don't Have Any Projects</p>
                <Button className="bg-gray-700 text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-1" /> CREATE NEW PROJECT
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Your Active Listings */}
          <Card className="border rounded-md overflow-hidden lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Your Active Listings</h2>
              <div className="border border-dashed rounded-md p-6 text-center">
                <p className="text-gray-500 mb-4">You Don't Have Any Listings</p>
                <Button className="bg-gray-700 text-white hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-1" /> LIST A PROPERTY
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ServiceProDashboard;
