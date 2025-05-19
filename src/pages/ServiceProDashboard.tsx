
import { useEffect, useState } from "react";
import ServiceProNavbar from "@/components/service-pro/ServiceProNavbar";
import ProfileCompletionCard from "@/components/service-pro/ProfileCompletionCard";
import AvailableJobsCard from "@/components/service-pro/AvailableJobsCard";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const ServiceProDashboard = () => {
  const { user } = useAuth();
  const [profileComplete, setProfileComplete] = useState(false);
  
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('service_pro_profiles')
          .select('is_profile_complete')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setProfileComplete(data?.is_profile_complete || false);
      } catch (error) {
        console.error("Error checking profile completion:", error);
      }
    };
    
    checkProfileCompletion();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceProNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Pro Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your business, find jobs, and connect with clients.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="available">
              <TabsList className="mb-4">
                <TabsTrigger value="available">Available Jobs</TabsTrigger>
                <TabsTrigger value="active">My Active Jobs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="available">
                <AvailableJobsCard />
              </TabsContent>
              
              <TabsContent value="active">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Jobs</h3>
                  <p className="text-gray-500">
                    You don't have any active jobs at the moment. Browse available jobs to start bidding.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="text-center py-6">
                <p className="text-gray-500">No recent activity to display.</p>
                <p className="text-gray-400 text-sm mt-1">Your recent interactions will appear here.</p>
              </div>
            </div>
          </div>
          
          <div>
            {!profileComplete && <ProfileCompletionCard />}
            
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Bids Submitted</p>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Jobs Completed</p>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Avg. Rating</p>
                  <p className="text-2xl font-bold text-orange-600">-</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Response Rate</p>
                  <p className="text-2xl font-bold text-orange-600">-</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-500 mb-4">
                Find guides and resources to help you make the most of your service pro account.
              </p>
              <ul className="list-disc list-inside text-orange-600">
                <li className="mb-2">
                  <a href="#" className="hover:underline">Getting started guide</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Creating a winning bid</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Building your portfolio</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceProDashboard;
