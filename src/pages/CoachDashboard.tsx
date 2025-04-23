
import { useState } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ProjectList from "@/components/coach/ProjectList";
import MessageCenter from "@/components/coach/MessageCenter";
import JWTDebugger from "@/components/debug/JWTDebugger";
import { useCoachProjects } from "@/hooks/useCoachProjects";

const CoachDashboard = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const { fetchProjects } = useCoachProjects();

  const handleRefresh = () => {
    fetchProjects();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      <JWTDebugger />
      <main className="flex-1 p-4 md:p-10">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Monitor projects, communicate with residents, and provide assistance.
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Data
          </Button>
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
