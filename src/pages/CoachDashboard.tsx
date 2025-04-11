
import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "@/components/coach/ProjectList";
import MessageCenter from "@/components/coach/MessageCenter";

const CoachDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("projects");
  const [isLoading, setIsLoading] = useState(false);

  if (!profile || profile.role !== 'coach') {
    return (
      <div className="min-h-screen bg-white">
        <DashboardNavbar />
        <main className="p-6 md:p-10">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Access Denied</h3>
                <p className="text-gray-500 mt-2">You don't have permission to access the coach dashboard.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <main className="flex-1 p-4 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor projects, communicate with residents, and provide assistance.
          </p>
        </div>
        
        <Tabs defaultValue="projects" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="projects">All Projects</TabsTrigger>
            <TabsTrigger value="messages">Message Center</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-6">
            <ProjectList />
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-6">
            <MessageCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoachDashboard;
